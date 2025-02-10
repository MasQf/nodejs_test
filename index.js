const express = require('express');
const mongoose = require('mongoose');
const socket = require('socket.io');
const path = require('path');
const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');
const uploadRouter = require('./routes/upload');
const itemRouter = require('./routes/item');
const setupChatSocket = require('./sockets/chat');

const app = express();
const PORT = 3000;
const DB = 'mongodb+srv://2767987137:msk20020407@cluster0.j7md3.mongodb.net/';

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// 连接数据库
mongoose.connect(DB).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

app.use(express.json());
app.use(userRouter);
app.use(chatRouter);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(uploadRouter);
app.use(itemRouter);

// 初始化 Socket.IO
setupChatSocket(io);
