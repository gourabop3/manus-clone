const express = require('express');
const {
  upload,
  uploadFile,
  getFile,
  deleteFile,
  getUserFiles
} = require('../controllers/fileController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// File routes
router.get('/', protect, getUserFiles);
router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/:filename', optionalAuth, getFile);
router.delete('/:filename', protect, deleteFile);

module.exports = router;

