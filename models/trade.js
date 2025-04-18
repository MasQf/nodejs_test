// 订单trade
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tradeSchema = new Schema({
    sellerId: {
        type: String,
        required: true
    },
    buyerId: {
        type: String,
        required: true
    },
    itemId: {
        type: String,
        required: true
    },
    // 交易地点
    location: {
        type: String,
        required: true
    },
    // 交易时间
    tradeTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        // 订单状态有：待交易、已完成、已取消
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

const Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;