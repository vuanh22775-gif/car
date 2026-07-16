// Vercel Serverless Function entrypoint.
// Vercel gọi file này cho MỌI request (xem routing trong vercel.json),
// và tự tái sử dụng cùng module giữa các lần gọi ("warm" invocations) khi có thể,
// vì vậy kết nối MongoDB trong ./src/config/database.js nên dùng cache kết nối.
module.exports = require('../src/server');
