// backend/middleware/upload.js - replace entirely with this
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const dirs = [
  'uploads/avatars',
  'uploads/resumes',
  'uploads/certificates',
];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, 'uploads/resumes');
    } else if (file.fieldname === 'certificate') {
      cb(null, 'uploads/certificates');
    } else {
      cb(null, 'uploads/avatars');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    cb(null, file.mimetype === 'application/pdf');
  } else if (file.fieldname === 'certificate') {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  } else {
    // Avatar
    cb(null, file.mimetype.startsWith('image/'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;