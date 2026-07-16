const express = require('express');
const router = express.Router();

// ── Trang công khai (Phase 1 - đã hoàn thành) ─────────────────────────────────
router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Trang chủ' });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'Giới thiệu' });
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', { title: 'Liên hệ' });
});

router.get('/vehicles', (req, res) => {
  res.render('pages/vehicles', { title: 'Danh sách xe' });
});

router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Đăng nhập' });
});

router.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Đăng ký' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Các trang dưới đây (chi tiết xe, đặt xe, hồ sơ, trang quản trị...) sẽ được
// chuyển đổi ở giai đoạn tiếp theo. Tạm thời trả về trang "đang phát triển" để
// tránh lỗi 404 khi người dùng bấm vào các liên kết tương ứng trong giao diện.
// ─────────────────────────────────────────────────────────────────────────────
const comingSoonRoutes = [
  '/vehicles/:id',
  '/profile',
  '/booking',
  '/booking-history',
  '/favorites',
  '/my-vehicles',
  '/register-owner',
  '/admin',
  '/admin/vehicles',
  '/admin/bookings',
  '/admin/users',
  '/admin/reports',
];

comingSoonRoutes.forEach((route) => {
  router.get(route, (req, res) => {
    res.render('pages/coming-soon', { title: 'Đang phát triển', path: req.path });
  });
});

module.exports = router;
