// 收藏模型
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }, // 用户ID
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    }, // 物品ID
    createdAt: {
        type: Date,
        default: Date.now,
    }, // 收藏时间
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
