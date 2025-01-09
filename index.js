const express = require('express');
const mongoose = require('mongoose');
const socket = require('socket.io');
const path = require('path');
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');
const { sendMessage } = require('./services/chat');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = 3000;
const DB = 'mongodb+srv://2767987137:msk20020407@cluster0.j7md3.mongodb.net/';

// 启动 HTTP 服务器
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// 创建 Socket.IO 服务器
const io = socket(server, {
    cors: {
        origin: "*",  // 允许所有来源访问
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// 连接数据库
mongoose.connect(DB).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

app.use(express.json());
app.use(userRouter);
app.use(chatRouter);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(uploadRouter);


// Socket.IO 连接事件
io.on('connection', socket => {
    console.log('Client connected:', socket.id);

    // 监听加入房间事件
    socket.on('joinRoom', roomId => {
        socket.join(roomId); // 将用户加入指定房间
        console.log(`User joined room: ${roomId}`);
    });

    // 监听消息发送事件
    socket.on('sendMessage', async data => {
        const { roomId, senderId, receiverId, content, type, time } = data;
        console.log(`Message sent from ${senderId} to ${receiverId} in room ${roomId}:`, data);

        try {
            // 调用 sendMessage 函数保存消息并更新聊天会话
            await sendMessage(roomId, senderId, receiverId, content, type, time);

            // 广播消息到指定房间的其他用户
            io.to(roomId).emit('receiveMessage', {
                roomId,
                senderId,
                receiverId,
                content,
                type,
                time: new Date().toISOString(),
            });

            console.log(`Message sent and chat updated`);
        } catch (err) {
            console.error(err);
        }
    });

    // 监听用户断开连接
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});