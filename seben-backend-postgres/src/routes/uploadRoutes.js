// backend/src/routes/uploadRoutes.js
const express = require('express');
const upload = require('../config/multer');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Upload images (Admin only)
router.post('/', protect, restrictTo('ADMIN'), upload.array('images', 10), (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const files = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname
  }));

  res.status(200).json({
    status: 'success',
    data: { files }
  });
});

module.exports = router;