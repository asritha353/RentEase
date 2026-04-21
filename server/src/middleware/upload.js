const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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

// Get the base URL of this server dynamically
const getServerBaseUrl = () => {
  const renderUrl = process.env.RENDER_EXTERNAL_URL; // Render sets this automatically
  if (renderUrl) return renderUrl;
  return `http://localhost:${process.env.PORT || 3001}`;
};

// Attempt Cloudinary upload; fall back to local server URL if not configured
const uploadToCloudinary = async (filePath) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || cloudName === 'your_cloud_name' || !apiKey || !apiSecret) {
      // Fall back to serving from this server using the correct public URL
      const baseUrl = getServerBaseUrl();
      return `${baseUrl}/uploads/${path.basename(filePath)}`;
    }

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    const result = await cloudinary.uploader.upload(filePath, { folder: 'rentease' });
    return result.secure_url;
  } catch (err) {
    console.warn('Cloudinary upload failed, using local URL:', err.message);
    const baseUrl = getServerBaseUrl();
    return `${baseUrl}/uploads/${path.basename(filePath)}`;
  }
};

module.exports = { upload, uploadToCloudinary };
