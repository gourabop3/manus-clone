const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: [
      'research',
      'content_creation',
      'data_analysis',
      'image_generation',
      'document_creation',
      'web_development',
      'automation',
      'other'
    ],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedDuration: {
    type: Number, // in minutes
    default: null
  },
  actualDuration: {
    type: Number, // in minutes
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  files: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiModel: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ status: 1, createdAt: -1 });

// Virtual for task duration
taskSchema.virtual('duration').get(function() {
  if (this.startedAt && this.completedAt) {
    return Math.round((this.completedAt - this.startedAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Method to update progress
taskSchema.methods.updateProgress = function(progress, status = null) {
  this.progress = Math.max(0, Math.min(100, progress));
  
  if (status) {
    this.status = status;
  }
  
  if (progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to start task
taskSchema.methods.start = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

// Method to complete task
taskSchema.methods.complete = function(result = null) {
  this.status = 'completed';
  this.progress = 100;
  this.completedAt = new Date();
  if (result) {
    this.result = result;
  }
  return this.save();
};

// Method to fail task
taskSchema.methods.fail = function(error = null) {
  this.status = 'failed';
  if (error) {
    this.metadata.error = error;
  }
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);

