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
    default: 'gpt-4.1-mini'
  },
  systemPrompt: {
    type: String,
    default: 'You are Manus, a helpful AI assistant that can perform various tasks including research, content creation, data analysis, and more. You are designed to be helpful, harmless, and honest.'
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
      max: 4000,
      default: 1000
    },
    topP: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
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

