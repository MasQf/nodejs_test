//消息模型
var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    // 房间ID
    roomId: {
        type: String,
        required: true,
    },
    // 发送者ID
    senderId: {
        type: String,
        required: true,
    },
    // 接收者ID
    receiverId: {
        type: String,
        required: true,
    },
    // 消息内容
    content: {
        type: String,
        required: true,
    },
    // 消息类型
    type: {
        type: String,
        required: true,
    },
    // 发送时间
    time: {
        type: Date,
        default: Date.now,
    },
})

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;