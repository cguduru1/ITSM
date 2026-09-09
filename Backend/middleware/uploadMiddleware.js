// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Ensure uploads folder exists safely
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Sanitize filename to prevent URL/path encoding issues
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

// 3. Base Multer configuration (10MB file limit)
const baseUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 4. Wrapper middleware to append storageUrl
const uploadMiddleware = {
  single(fieldName) {
    return (req, res) => {
      baseUpload.single(fieldName)(req, res, (err) => {
        if (err) return;

        if (req.file) {
          // Generates static accessible path
          req.file.storageUrl = `/uploads/${req.file.filename}`;
        }
      });
    };
  }
};

export default uploadMiddleware;