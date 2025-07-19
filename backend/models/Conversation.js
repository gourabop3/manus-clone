const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  messages: [messageSchema],
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  aiModel: {
    type: String,
    enum: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    default: 'gpt-4o-mini'
  },
  systemPrompt: {
    type: String,
    default: `You are Manus, a general AI agent that bridges minds and actions. You don't just think, you deliver results.

Your capabilities include:
- Research and analysis
- Content creation and writing
- Data analysis and visualization
- Code generation and debugging
- Task planning and execution
- Creative design and ideation
- Problem solving and optimization

You are designed to be:
- Helpful: Provide practical, actionable solutions
- Harmless: Ensure all outputs are safe and ethical
- Honest: Be transparent about your capabilities and limitations
- Efficient: Get things done quickly and effectively

When users give you tasks, think step-by-step and provide comprehensive solutions. If you need to break down complex tasks, do so automatically. Always aim to deliver complete, working results.`
  },
  settings: {
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: 1,
      max: 128000,
      default: 4000
    },
    topP: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    frequencyPenalty: {
      type: Number,
      min: -2,
      max: 2,
      default: 0
    },
    presencePenalty: {
      type: Number,
      min: -2,
      max: 2,
      default: 0
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
conversationSchema.index({ user: 1, updatedAt: -1 });
conversationSchema.index({ user: 1, isActive: 1 });

// Virtual for message count
conversationSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Virtual for last message
conversationSchema.virtual('lastMessage').get(function() {
  return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
});

// Method to add message
conversationSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    metadata
  });
  
  // Auto-generate title from first user message if not set
  if (!this.title && role === 'user' && this.messages.length <= 2) {
    this.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
  }
  
  return this.save();
};

// Method to get conversation history for AI
conversationSchema.methods.getHistory = function(limit = 20) {
  const messages = this.messages.slice(-limit).map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  // Add system prompt if not already present
  if (messages.length === 0 || messages[0].role !== 'system') {
    messages.unshift({
      role: 'system',
      content: this.systemPrompt
    });
  }
  
  return messages;
};

// Method to clear conversation
conversationSchema.methods.clear = function() {
  this.messages = [];
  this.title = null;
  return this.save();
};

// Method to archive conversation
conversationSchema.methods.archive = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);

