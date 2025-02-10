// chat.js
const Message = require('../models/message');
const Chat = require('../models/chat');

const sendMessage = async (roomId, senderId, receiverId, content, type) => {
    try {
        // 保存消息到 Message 集合
        const newMessage = await Message.create({
            roomId,
            senderId,
            receiverId,
            content,
            type,
        });

        // 获取消息的 ObjectId
        const messageId = newMessage._id;

        // 更新或创建 Chat 数据
        await Chat.findOneAndUpdate(
            { roomId }, // 根据 roomId 查找
            {
                $set: {
                    roomId,
                    lastMessage: messageId, // 保存消息的 ObjectId
                },
                $addToSet: { participants: { $each: [senderId, receiverId] } }, // 添加参与者
                // 只增加接收者的未读消息数
                $inc: { [`unreadCount.${receiverId}`]: 1 }, // 只有接收者的未读消息数增加
            },
            { upsert: true, new: true } // 如果没有找到会话，则创建新的会话
        );

    } catch (err) {
        console.error(err);
        throw new Error('Internal server error');
    }
};


module.exports = { sendMessage };
