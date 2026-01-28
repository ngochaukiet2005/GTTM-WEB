let io = null;

const init = (ioInstance) => {
    io = ioInstance;
    
    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // Tài xế join vào room riêng của mình bằng ID (để gửi thông báo riêng cho tài xế đó)
        socket.on("join_driver_room", (driverId) => {
            if (driverId) {
                socket.join(`driver_${driverId}`);
                console.log(`🚗 Driver ${driverId} joined room: driver_${driverId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log("❌ User disconnected");
        });
    });
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Hàm tiện ích để gửi thông báo đến 1 tài xế cụ thể
const notifyDriver = (driverId, event, data) => {
    if (io) {
        io.to(`driver_${driverId}`).emit(event, data);
        console.log(`📢 Emitted [${event}] to driver_${driverId}`);
    }
};

module.exports = { init, getIO, notifyDriver };