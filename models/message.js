//消息模型
var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
})

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;