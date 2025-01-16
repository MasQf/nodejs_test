const mongoose = require('mongoose')

// 物品模型
const itemSchema = new mongoose.Schema(
    {
        // 物品名称
        name: {
            type: String,
            required: true,
        },
        // 价格
        price: {
            type: Number,
            required: true,
        },
        // 描述
        description: {
            type: String,
            required: true,
        },
        // 分类
        category: {
            type: String,
            required: true,
        },
        // 图片
        images: {
            type: [String],
            required: true,
        },
        // 物品拥有者
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // 物品状态,只有true上架或false下架
        status: {
            type: Boolean,
            default: true,
        },
        // 发布位置
        location: {
            type: String,
            required: false,
        },
        // 浏览数
        views: {
            type: Number,
            default: 0,
        },
        // 收藏数
        favoritesCount: {
            type: Number,
            default: 0,
        },
        // 是否可议价
        isNegotiable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

const Item = mongoose.model('Item', itemSchema)

module.exports = Item
