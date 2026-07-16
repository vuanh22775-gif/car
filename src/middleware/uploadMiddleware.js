const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Kiểm tra xem đã cấu hình đầy đủ biến môi trường Cloudinary chưa
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let upload;

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, WEBP'), false);
  }
};

if (useCloudinary) {
  // 1. CHẠY TRÊN PRODUCTION (VERCEL): Đẩy thẳng lên Cloudinary
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
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB / file
  });
} else {
  // 2. FALLBACK (AN TOÀN CHO CẢ VERCEL LẪN LOCAL): Sử dụng Memory Storage thay vì Disk Storage
  // Việc này loại bỏ hoàn toàn lệnh `fs.mkdirSync` gây sập server trên Vercel.
  const storage = multer.memoryStorage();

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB / file
  });
}

module.exports = upload;
module.exports.usingCloudinary = useCloudinary;