const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(path.join(uploadDir, 'audio'));
fs.ensureDirSync(path.join(uploadDir, 'images'));

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    if (file.fieldname === 'audio') {
      uploadPath = path.join(uploadDir, 'audio');
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(uploadDir, 'images');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedAudioTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/webm'];
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.fieldname === 'audio') {
    if (allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type. Allowed types: wav, mp3, mpeg, m4a, webm'), false);
    }
  } else if (file.fieldname === 'image') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type. Allowed types: jpeg, jpg, png, gif, webp'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Middleware for audio uploads
const uploadAudio = upload.single('audio');

// Middleware for image uploads
const uploadImage = upload.single('image');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      error: 'File upload error: ' + error.message
    });
  }
  
  if (error) {
    return res.status(400).json({
      error: error.message
    });
  }
  
  next();
};

module.exports = {
  uploadAudio,
  uploadImage,
  handleUploadError
}; 