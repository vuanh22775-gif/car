const mongoose = require('mongoose');

// ── Cache kết nối cho môi trường serverless (Vercel) ─────────────────────────
// Trên Vercel, mỗi "cold start" chạy lại toàn bộ module, nếu gọi mongoose.connect()
// mỗi lần sẽ tạo rất nhiều kết nối dư thừa và có thể làm chậm/lỗi ứng dụng.
// Dùng biến global để tái sử dụng kết nối giữa các lần gọi hàm khi có thể
// ("warm" invocation).
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB Connected Successfully');
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB Connection Error:', error);
    // Trên máy local (không phải serverless) thì dừng hẳn tiến trình để dễ nhận ra lỗi cấu hình.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
