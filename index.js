const express = require('express')
const mongoose = require('mongoose')
const http = require('http');
const { Server } = require('socket.io');
const userRouter = require('./routes/user')
const Message = require('./models/message')

const app = express()
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000
const DB = 'mongodb+srv://2767987137:msk20020407@cluster0.j7md3.mongodb.net/'

mongoose.connect(DB).then(() => console.log('MongoDB connected')).catch(err => console.log(err))

app.use(express.json())
app.use(userRouter)

// 用户连接
io.on('connection', (socket) => {
    console.log('用户已连接:', socket.id);

    // 加入房间
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`用户 ${socket.id} 加入房间 ${roomId}`);
    });

    // 接收消息并广播
    socket.on('sendMessage', async (message) => {
        const { roomId, senderId, content, type } = message;
        console.log(`接收消息:`, message);

        // 保存消息到数据库
        const newMessage = new Message({
            roomId,
            senderId,
            content,
            type,
            time: new Date(),
        });
        await newMessage.save();

        // 广播消息到房间
        io.to(roomId).emit('receiveMessage', {
            senderId,
            content,
            type,
            time: newMessage.time,
        });
    });

    // 用户断开
    socket.on('disconnect', () => {
        console.log('用户已断开连接:', socket.id);
    });
});


app.listen(PORT, '0.0.0.0', () => console.log(`server is running on port ${PORT}!`))