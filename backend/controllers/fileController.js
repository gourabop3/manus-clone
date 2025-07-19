const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Task = require('../models/Task');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { taskId } = req.body;

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };

    // If taskId provided, associate with task
    if (taskId) {
      const task = await Task.findOne({
        _id: taskId,
        user: req.user.id
      });

      if (task) {
        task.files.push(fileData);
        await task.save();
      }
    }

    res.json({
      success: true,
      data: {
        file: fileData,
        url: `/api/files/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading file'
    });
  }
};

// @desc    Get file
// @route   GET /api/files/:filename
// @access  Public (with proper security checks)
const getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting file'
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:filename
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Remove file from filesystem
    await fs.unlink(filePath);

    // Remove file reference from tasks
    await Task.updateMany(
      { user: req.user.id },
      { $pull: { files: { filename: filename } } }
    );

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting file'
    });
  }
};

// @desc    Get user files
// @route   GET /api/files
// @access  Private
const getUserFiles = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get all tasks with files for this user
    const tasks = await Task.find({
      user: req.user.id,
      'files.0': { $exists: true }
    })
    .select('files title')
    .sort({ updatedAt: -1 });

    // Flatten files array
    const allFiles = [];
    tasks.forEach(task => {
      task.files.forEach(file => {
        allFiles.push({
          ...file.toObject(),
          taskId: task._id,
          taskTitle: task.title
        });
      });
    });

    // Sort by upload date
    allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFiles = allFiles.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allFiles.length,
          pages: Math.ceil(allFiles.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting files'
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  getFile,
  deleteFile,
  getUserFiles
};

