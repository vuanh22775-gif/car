const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// ── View engine (EJS) ────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // trang dùng CDN (Tailwind fallback, lucide icon, ...) nên tắt CSP mặc định
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Kết nối MongoDB ───────────────────────────────────────────────────────────
connectDB();

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// Chỉ dùng khi chạy local & KHÔNG cấu hình Cloudinary (xem middleware/uploadMiddleware.js)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API routes (giữ nguyên toàn bộ, không đổi logic backend) ─────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/userNotificationRoutes'));

// ── Web routes (render các trang EJS, thay thế cho React Router) ─────────────
app.use('/', require('./routes/webRoutes'));

// ── 404 cho API ───────────────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint không tồn tại' });
});

// ── 404 cho trang web ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Không tìm thấy trang' });
});

// ── Error handler chung ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Lỗi server',
    });
  }
  res.status(500).render('pages/500', { title: 'Lỗi hệ thống' });
});

const PORT = process.env.PORT || 5000;

// Vercel (serverless) sẽ import "app" thông qua api/index.js và tự quản lý cổng,
// nên chỉ app.listen() khi chạy trực tiếp bằng "node src/server.js" / nodemon.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  });
}

// Nội dung chuẩn của api/index.js
const app = require('../src/server.js');

module.exports = app;