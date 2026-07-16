# MOTO – Bản chuyển đổi sang Express + EJS (giai đoạn 1)

Dự án gốc (React + TypeScript + Vite) đã được chuyển sang **Node.js/Express + EJS**
để chạy như một ứng dụng web render phía server, sẵn sàng deploy lên **Vercel**.

## 🚧 Trạng thái chuyển đổi

Đây là một dự án lớn (~30 trang, ~7.500 dòng React/TS). Vì khối lượng công việc
rất lớn nếu muốn giữ đúng 100% chức năng và giao diện, mình đã chia thành nhiều
giai đoạn. **Giai đoạn 1 (đã hoàn thành trong bản này)** gồm:

✅ Hạ tầng dùng chung: Express + EJS, layout chính (Header/Footer), toast,
   chatbot Mia, chuông thông báo, xác thực JWT (login/register/logout) đồng bộ giao diện.
✅ Trang chủ (Home)
✅ Giới thiệu (About)
✅ Liên hệ (Contact) + mở chatbot
✅ Đăng nhập / Đăng ký (Login/Register)
✅ Danh sách xe + bộ lọc + phân trang (Vehicles + VehicleFilter)
✅ Cấu hình Vercel (vercel.json, api/index.js) + chuyển upload ảnh sang Cloudinary
   (bắt buộc vì Vercel không có ổ đĩa cố định để lưu ảnh)
✅ Toàn bộ API backend gốc (controllers/models/routes) giữ nguyên không đổi logic

⏳ **Còn lại cho giai đoạn 2** (hiện đang hiển thị trang "Đang phát triển"):
- Chi tiết xe (VehicleDetail) + đặt xe (Booking) + lịch đặt xe (calendar)
- Hồ sơ cá nhân (Profile)
- Lịch sử đặt xe (BookingHistory)
- Yêu thích (Favorites)
- Xe của tôi (MyVehicles - dành cho chủ xe)
- Trang quản trị (Admin, AdminVehicles, AdminBookings, AdminUsers, AdminReports
  với biểu đồ recharts)

👉 Nhắn lại cho mình để tiếp tục hoàn thiện giai đoạn 2 nhé.

## 📁 Cấu trúc thư mục

```
moto-ejs/
├── api/index.js          # Entry point cho Vercel Serverless Function
├── src/
│   ├── server.js          # Express app chính (view engine EJS + toàn bộ API)
│   ├── config/            # database.js (có cache kết nối cho serverless), cloudinary.js
│   ├── controllers/       # Giữ nguyên từ backend gốc
│   ├── middleware/        # auth.js giữ nguyên, uploadMiddleware.js đã đổi sang Cloudinary
│   ├── models/             # Giữ nguyên từ backend gốc
│   ├── routes/             # Giữ nguyên API routes gốc + thêm webRoutes.js (render trang EJS)
│   └── services/           # Giữ nguyên từ backend gốc
├── views/
│   ├── layouts/main.ejs    # Layout chính (Header/Footer)
│   ├── partials/           # header.ejs, footer.ejs
│   └── pages/              # Các trang: home, about, contact, vehicles, login, register, ...
├── public/
│   ├── css/                # tailwind.css (build tĩnh) + app.css
│   └── js/                 # api.js, auth.js, header.js, chatbot.js, vehicles.js, ...
├── vercel.json
├── package.json
└── .env / .env.example
```

## 🖥️ Chạy ở máy cá nhân (local)

```bash
npm install
npm run build:css   # build Tailwind CSS tĩnh (chạy lại mỗi khi sửa class Tailwind mới)
npm run dev          # hoặc: npm start
```

Mở trình duyệt tại `http://localhost:5000`.

File `.env` đã được sao chép từ cấu hình gốc (MONGODB_URI, JWT_SECRET...) nên
chạy được ngay. Nếu muốn upload ảnh hoạt động ở local, cần điền thêm 3 biến
`CLOUDINARY_*` trong `.env` (đăng ký miễn phí tại cloudinary.com); nếu để trống,
hệ thống tự lưu ảnh vào ổ đĩa cục bộ `uploads/vehicles` (chỉ dùng để phát triển).

## ☁️ Deploy lên Vercel

1. Đẩy thư mục này lên một Git repository (GitHub/GitLab/Bitbucket).
2. Vào [vercel.com](https://vercel.com) → **Add New Project** → chọn repo.
3. Trong phần **Environment Variables**, khai báo:
   - `MONGODB_URI` (khuyến nghị dùng MongoDB Atlas, không dùng MongoDB local)
   - `JWT_SECRET`, `JWT_EXPRE` (JWT_EXPIRE)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
     (**bắt buộc** – nếu thiếu, chức năng upload ảnh xe sẽ báo lỗi trên Vercel
     vì serverless function không có ổ đĩa cố định)
   - `CLIENT_URL` = URL Vercel của bạn (vd: `https://moto-yourname.vercel.app`)
4. Vercel sẽ tự chạy `npm run vercel-build` (build Tailwind CSS) rồi deploy.
5. `vercel.json` đã cấu hình sẵn để mọi request đi qua `api/index.js`
   (Express app), bao gồm cả các file tĩnh trong `public/`.

## ⚠️ Lưu ý quan trọng về Vercel Serverless

- **Không dùng ổ đĩa cục bộ để lưu dữ liệu lâu dài.** Đó là lý do middleware
  upload ảnh xe đã được chuyển từ `multer` (lưu đĩa) sang Cloudinary.
- **Kết nối MongoDB có cache** (`src/config/database.js`) để tránh việc mỗi
  lần gọi function lại tạo kết nối mới, giúp tránh vượt giới hạn kết nối của
  MongoDB Atlas (đặc biệt là gói Free/M0).
- Session/JWT vẫn lưu ở `localStorage` phía trình duyệt (giống bản gốc dùng
  axios interceptor), không dùng cookie — vì vậy các trang "cần đăng nhập"
  được bảo vệ ở phía client (JS kiểm tra token khi tải trang), giống hệt cách
  `PrivateRoute`/`AdminRoute` hoạt động trong bản React gốc.

## 🎨 Về giao diện

- Toàn bộ màu sắc, khoảng cách, font (Inter), animation được giữ nguyên từ
  `tailwind.config.js` gốc, build thành file CSS tĩnh (không dùng Tailwind CDN)
  để đảm bảo tốc độ tải và không có cảnh báo "không dùng cho production".
- Icon dùng bộ **lucide** (qua CDN `unpkg.com/lucide`) — cùng bộ icon với
  `lucide-react` bản gốc nên hình dạng icon giữ nguyên 100%.
