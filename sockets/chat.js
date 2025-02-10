// sockets/chat.js
const Chat = require('../models/chat');
const { sendMessage } = require('../services/chat');

module.exports = function setupChatSocket(io) {
    io.on('connection', socket => {
        // 获取 userId
        const userId = socket.handshake.query.userId;
        console.log('User connected with userId:', userId);

        // 保存 userId 到 socket 上
        socket.userId = userId;

        // 加入房间
        socket.on('joinRoom', roomId => {
            socket.join(roomId);
            console.log(`${socket.userId} joined room: ${roomId}`);
        });

        // 离开房间
        socket.on('leaveRoom', roomId => {
            socket.leave(roomId);
            console.log(`${socket.userId} left room ${roomId}`);
        });

        // 进入聊天详情页, 重置未读消息数
        socket.on('resetUnreadCount', async (data) => {
            const { roomId, userId } = data;
            try {
                await Chat.updateOne(
                    { roomId },
                    { $set: { [`unreadCount.${userId}`]: 0 } }
                );
                console.log(`Reset unreadCount for user ${userId} in room ${roomId}`);
            } catch (err) {
                console.error(`Error resetting unreadCount: ${err.message}`);
            }
        });

        // 发送消息
        socket.on('sendMessage', async data => {
            const { roomId, senderId, receiverId, content, type, time } = data;
            console.log(`Message sent from ${senderId} to ${receiverId} in room ${roomId}:`, data);

            try {
                // 发送消息并更新 Chat 数据
                await sendMessage(roomId, senderId, receiverId, content, type, time);

                // 向该roomId对应的房间内的所有用户广播消息
                io.to(roomId).emit('receiveMessage', {
                    roomId,
                    senderId,
                    receiverId,
                    content,
                    type,
                    time: new Date().toISOString(),
                });

                // 检查接收者是否在房间中
                const roomClients = await io.in(roomId).fetchSockets();
                console.log(`Clients in roomId ${roomId}:`, roomClients.map(s => s.userId));
                const isReceiverInRoom = roomClients.some(socket => socket.userId === receiverId);

                if (isReceiverInRoom) {
                    // 接收者在房间中，重置未读消息数
                    await Chat.updateOne(
                        { roomId },
                        { $set: { [`unreadCount.${receiverId}`]: 0 } }
                    );
                    console.log(`Unread count reset for user ${receiverId}`);
                } else {
                    // 接收者不在房间，通知刷新聊天列表
                    io.to(receiverId).emit('refreshChatList', { roomId, senderId });
                    console.log(`Refresh chat list for user ${receiverId}`);
                }

                // io.to(receiverId).emit('refreshChatList', { roomId, senderId });
            } catch (err) {
                console.error(err);
            }
        });

        // 断开连接
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
