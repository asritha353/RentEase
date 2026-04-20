const multer = require('multer');
const path   = require('path');
const os     = require('os');

const uploadsDir = path.join(__dirname, '../../uploads');

// Store files in local uploads dir
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files (jpg, png, webp) are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Attempt Cloudinary upload; fall back to local server URL if not configured
const uploadToCloudinary = async (filePath) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      // Return local URL
      return `http://localhost:${process.env.PORT || 3001}/uploads/${path.basename(filePath)}`;
    }
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const result = await cloudinary.uploader.upload(filePath, { folder: 'rentease' });
    return result.secure_url;
  } catch (err) {
    console.warn('Cloudinary upload failed, using local URL:', err.message);
    return `http://localhost:${process.env.PORT || 3001}/uploads/${path.basename(filePath)}`;
  }
};

module.exports = { upload, uploadToCloudinary };
