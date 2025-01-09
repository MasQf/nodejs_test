const mongoose = require('mongoose');
const Message = require('./message');

const chatSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
    }, // 聊天房间ID
    participants: [{
        type: String,
        required: true,
    }], // 参与者（用户ID数组）
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,  // 使用 ObjectId 引用 Message 模型
        ref: 'Message',  // 引用 Message 模型
        required: true,
    }, // 最近一条消息
    unreadCount: {
        type: Number,
        default: 0,
    }, // 未读消息数量
    createdAt: {
        type: Date,
        default: Date.now,
    }, // 会话创建时间
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
