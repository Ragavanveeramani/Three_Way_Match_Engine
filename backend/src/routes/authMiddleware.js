import multer from 'multer';
import path from 'path';

// Multer Config for Local File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Bearer Token Auth Middleware
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next(); // Accepts any valid bearer token for mock auth
  }
  return res.status(401).json({ message: 'Unauthorized access. Token required.' });
};

export   { upload, protect };