const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http'); // 1. Import module http
const { Server } = require("socket.io"); // 2. Import Socket.io

const env = require('./configs/env');
const connectDB = require('./configs/database');
const errorHandler = require("./middlewares/errorHandle.middleware");
const Route = require("./routes/index.route");
const socketService = require("./services/socketService"); // 3. Import socket service
const seedData = require("./services/seedService"); // Import seed service

const app = express();
const server = http.createServer(app); // 4. Tạo HTTP server bọc lấy app Express

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// 5. Cấu hình Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Cho phép mọi domain kết nối (bạn có thể giới hạn lại nếu cần)
        methods: ["GET", "POST"]
    }
});

// 6. Khởi tạo socket service để dùng chung cho toàn app
socketService.init(io);

(async () => {
    try {
        // connect database
        await connectDB();

        // seed initial data
        await seedData();

        // init routes
        app.use("/api", Route);

        // root routes for testing
        app.get('/', (req, res) => {
            res.json({ message: 'Welcome to Smart Shuttle Dispatch System API' });
        });

        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok', uptime: process.uptime() });
        });

        // error handler (should be last)
        app.use(errorHandler);

        // 7. QUAN TRỌNG: Thay app.listen bằng server.listen
        server.listen(env.port, () => {
            console.log(`🚀 Server running on port ${env.port}`);
            console.log(`📡 Socket.io ready`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();