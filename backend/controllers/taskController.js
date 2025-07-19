const Task = require('../models/Task');
const Conversation = require('../models/Conversation');

// @desc    Get user tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category, 
      priority,
      search 
    } = req.query;

    // Build filter
    const filter = { user: req.user.id };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('conversation', 'title')
      .populate('user', 'username firstName lastName');

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting tasks'
    });
  }
};

// @desc    Get specific task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    })
    .populate('conversation', 'title messages')
    .populate('user', 'username firstName lastName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting task'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority = 'medium',
      category = 'other',
      tags = [],
      estimatedDuration,
      aiModel = 'gpt-3.5-turbo'
    } = req.body;

    const task = await Task.create({
      title,
      description,
      user: req.user.id,
      priority,
      category,
      tags,
      estimatedDuration,
      aiModel
    });

    // Create associated conversation
    const conversation = await Conversation.create({
      user: req.user.id,
      title: title,
      task: task._id,
      aiModel,
      systemPrompt: `You are Manus, an AI assistant working on the following task: "${title}". Description: "${description}". Please help the user complete this task efficiently and effectively.`
    });

    task.conversation = conversation._id;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('conversation', 'title')
      .populate('user', 'username firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      category,
      tags,
      progress,
      estimatedDuration,
      result,
      metadata
    } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (category) task.category = category;
    if (tags) task.tags = tags;
    if (estimatedDuration !== undefined) task.estimatedDuration = estimatedDuration;
    if (result !== undefined) task.result = result;
    if (metadata) task.metadata = { ...task.metadata, ...metadata };

    // Handle status changes
    if (status && status !== task.status) {
      task.status = status;
      
      if (status === 'in_progress' && !task.startedAt) {
        task.startedAt = new Date();
      } else if (status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
        task.progress = 100;
      }
    }

    // Handle progress updates
    if (progress !== undefined) {
      task.progress = Math.max(0, Math.min(100, progress));
      
      if (progress === 100 && task.status !== 'completed') {
        task.status = 'completed';
        task.completedAt = new Date();
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('conversation', 'title')
      .populate('user', 'username firstName lastName');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id.toString()).emit('taskUpdate', {
      taskId: task._id,
      status: task.status,
      progress: task.progress
    });

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete associated conversation
    if (task.conversation) {
      await Conversation.findByIdAndDelete(task.conversation);
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const categoryStats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ user: userId, status: 'in_progress' });

    res.json({
      success: true,
      data: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
        statusBreakdown: stats,
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting task statistics'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};

