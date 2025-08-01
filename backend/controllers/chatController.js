const Conversation = require('../models/Conversation');
const Task = require('../models/Task');
const openai = require('../config/openai');

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20, active = true } = req.query;
    
    const conversations = await Conversation.find({
      user: req.user.id,
      isActive: active === 'true'
    })
    .sort({ updatedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('task', 'title status');

    const total = await Conversation.countDocuments({
      user: req.user.id,
      isActive: active === 'true'
    });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting conversations'
    });
  }
};

// @desc    Get specific conversation
// @route   GET /api/chat/conversations/:id
// @access  Private
const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('task', 'title status progress');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting conversation'
    });
  }
};

// @desc    Create new conversation
// @route   POST /api/chat/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { title, aiModel = 'gpt-3.5-turbo', systemPrompt, settings } = req.body;

    const conversation = await Conversation.create({
      user: req.user.id,
      title,
      aiModel,
      systemPrompt,
      settings
    });

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating conversation'
    });
  }
};

// @desc    Send message to AI
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message, createTask = false } = req.body;
    const conversationId = req.params.id;

    let conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Add user message
    await conversation.addMessage('user', message);

    // Get conversation history
    const messages = conversation.getHistory();

    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
      }

      // Prepare messages for AI
      const aiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call OpenAI API with enhanced parameters
      const completion = await openai.chat.completions.create({
        model: conversation.aiModel,
        messages: aiMessages,
        temperature: conversation.settings.temperature,
        max_tokens: conversation.settings.maxTokens,
        top_p: conversation.settings.topP,
        frequency_penalty: conversation.settings.frequencyPenalty,
        presence_penalty: conversation.settings.presencePenalty,
        stream: false
      });

      const aiResponse = completion.choices[0].message.content;

      // Add AI response
      await conversation.addMessage('assistant', aiResponse, {
        model: conversation.aiModel,
        usage: completion.usage
      });

      // Create task if requested
      let task = null;
      if (createTask) {
        task = await Task.create({
          title: conversation.title || message.substring(0, 100),
          description: message,
          user: req.user.id,
          conversation: conversation._id,
          status: 'pending'
        });

        conversation.task = task._id;
        await conversation.save();
      }

      // Get updated conversation
      conversation = await Conversation.findById(conversationId).populate('task', 'title status progress');

      // Emit real-time update
      const io = req.app.get('io');
      io.to(req.user.id.toString()).emit('message', {
        conversationId: conversation._id,
        message: {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }
      });

      res.json({
        success: true,
        data: {
          conversation,
          task
        }
      });

    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      
      // Add error message
      await conversation.addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.', {
        error: aiError.message
      });

      res.status(500).json({
        success: false,
        message: 'Error communicating with AI service'
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// @desc    Send streaming message to AI
// @route   POST /api/chat/conversations/:id/stream
// @access  Private
const sendStreamingMessage = async (req, res) => {
  try {
    const { message, createTask = false } = req.body;
    const conversationId = req.params.id;

    let conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is not configured'
      });
    }

    // Add user message
    await conversation.addMessage('user', message);

    // Get conversation history
    const messages = conversation.getHistory();

    // Prepare messages for AI
    const aiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Set headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    let fullResponse = '';

    try {
      // Call OpenAI API with streaming
      const stream = await openai.chat.completions.create({
        model: conversation.aiModel,
        messages: aiMessages,
        temperature: conversation.settings.temperature,
        max_tokens: conversation.settings.maxTokens,
        top_p: conversation.settings.topP,
        frequency_penalty: conversation.settings.frequencyPenalty,
        presence_penalty: conversation.settings.presencePenalty,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content, type: 'chunk' })}\n\n`);
        }
      }

      // Add AI response to conversation
      await conversation.addMessage('assistant', fullResponse, {
        model: conversation.aiModel,
        usage: { total_tokens: fullResponse.length }
      });

      // Create task if requested
      let task = null;
      if (createTask) {
        task = await Task.create({
          title: conversation.title || message.substring(0, 100),
          description: message,
          user: req.user.id,
          conversation: conversation._id,
          status: 'pending'
        });

        conversation.task = task._id;
        await conversation.save();
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete', task })}\n\n`);
      res.end();

    } catch (aiError) {
      console.error('OpenAI API streaming error:', aiError);
      
      // Add error message
      await conversation.addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.', {
        error: aiError.message
      });

      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Error communicating with AI service' })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Send streaming message error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Server error sending message' })}\n\n`);
    res.end();
  }
};

// @desc    Update conversation
// @route   PUT /api/chat/conversations/:id
// @access  Private
const updateConversation = async (req, res) => {
  try {
    const { title, settings, systemPrompt } = req.body;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (title) conversation.title = title;
    if (settings) conversation.settings = { ...conversation.settings, ...settings };
    if (systemPrompt) conversation.systemPrompt = systemPrompt;

    await conversation.save();

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating conversation'
    });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/chat/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await conversation.deleteOne();

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting conversation'
    });
  }
};

// @desc    Clear conversation messages
// @route   POST /api/chat/conversations/:id/clear
// @access  Private
const clearConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await conversation.clear();

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing conversation'
    });
  }
};

// @desc    Get available AI models
// @route   GET /api/chat/models
// @access  Private
const getAvailableModels = async (req, res) => {
  try {
    const models = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable model for complex tasks',
        maxTokens: 128000,
        pricing: {
          input: 0.0025,
          output: 0.01
        }
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and efficient for most tasks',
        maxTokens: 128000,
        pricing: {
          input: 0.00015,
          output: 0.0006
        }
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Balanced performance and speed',
        maxTokens: 128000,
        pricing: {
          input: 0.01,
          output: 0.03
        }
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective',
        maxTokens: 16385,
        pricing: {
          input: 0.0005,
          output: 0.0015
        }
      }
    ];

    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting models'
    });
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  sendStreamingMessage,
  updateConversation,
  deleteConversation,
  clearConversation,
  getAvailableModels
};

