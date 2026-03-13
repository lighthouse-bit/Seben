// backend/src/routes/uploadRoutes.js
const express = require('express');
const upload = require('../config/multer');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Upload images (Admin only)
router.post('/', protect, restrictTo('ADMIN'), (req, res) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(400).json({ 
        status: 'error', 
        message: err.message || 'File upload failed' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No files uploaded' 
      });
    }

    // Return the relative path that will be stored in the DB
    const files = req.files.map(file => ({
      url: `/uploads/products/${file.filename}`, // Note the /products/ part
      filename: file.filename,
      originalName: file.originalname
    }));

    res.status(200).json({
      status: 'success',
      data: { files } // Frontend expects { files: [...] } inside data
    });
  });
});

module.exports = router;