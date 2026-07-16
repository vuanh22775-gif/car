const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// ── Vercel dùng file system read-only/tạm thời (ephemeral) ───────────────────
// Multer lưu local disk KHÔNG hoạt động đúng trên Vercel serverless functions:
// mỗi lần gọi hàm là một môi trường mới, ổ đĩa /uploads sẽ không tồn tại lâu dài
// và không được chia sẻ giữa các lần gọi. Vì vậy ảnh xe được upload thẳng lên
// Cloudinary (đã có sẵn trong dependencies gốc của dự án).
//
// Khi chạy local mà chưa cấu hình Cloudinary (.env thiếu CLOUDINARY_*), middleware
// sẽ tự động rơi về lưu đĩa cục bộ (../../uploads/vehicles) để tiện phát triển.

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let upload;

if (useCloudinary) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'moto/vehicles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB / file
  });
} else {
  // Fallback local (chỉ dùng khi phát triển ở máy cá nhân, KHÔNG dùng trên Vercel)
  const uploadDir = path.join(__dirname, '../../uploads/vehicles');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, WEBP'), false);
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

module.exports = upload;
module.exports.usingCloudinary = useCloudinary;
