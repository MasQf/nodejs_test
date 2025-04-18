// 物品相关接口
const express = require('express');
const itemRouter = express.Router();
const Item = require('../models/item');
const Favorite = require('../models/favorite');
const authMiddleware = require('../middlewares/auth');

// 获取物品列表
itemRouter.get('/items', async (req, res) => {
    try {
        const items = await Item.find().populate('ownerId').lean();
        // 将ownerId字段改为owner
        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '获取物品列表成功', status: true });
    } catch (err) {
        res.json({ msg: '获取物品列表失败', status: false });
    }
});

// 根据物品id获取物品详情
itemRouter.post('/item_detail', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.userId;

        const item = await Item.findById(itemId).populate('ownerId').lean();
        if (!item) {
            return res.json({ msg: '物品不存在', status: false });
        }
        // 将ownerId字段改为owner
        item.owner = item.ownerId;
        delete item.ownerId;

        // 查询用户是否收藏该商品
        const isFavorite = await Favorite.exists({ userId, itemId });
        item.isFavorite = !!isFavorite;

        res.json({ item, msg: '获取物品详情成功', status: true });
    } catch (err) {
        res.json({ msg: '获取物品详情失败', status: false });
    }
});

// 根据用户id获取 用户已发布的物品列表
itemRouter.post('/published_items', async (req, res) => {
    try {
        const { userId } = req.body;
        const items = await Item.find({ ownerId: userId }).populate('ownerId').sort({ _id: -1 }).lean();
        // 将ownerId字段改为owner
        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '根据用户id获取物品列表成功', status: true });
    } catch (err) {
        res.json({ msg: '根据用户id获取物品列表失败', status: false });
    }
});

// 获取最近发布的物品列表(分页查询,默认page从1开始，size默认值为10)
itemRouter.post('/latest_items', async (req, res) => {
    try {
        const { page = 1, size = 10 } = req.body;
        const items = await Item.find().populate('ownerId').sort({ _id: -1 }).skip((page - 1) * size).limit(parseInt(size)).lean();

        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '获取最近发布的物品列表成功', status: true });
    } catch (err) {
        res.json({ msg: '获取最近发布的物品列表失败', status: false });
    }
});

// 获取最多收藏的物品列表(分页查询)
itemRouter.post('/most_favorites_items', async (req, res) => {
    try {
        const { page = 1, size = 10 } = req.body;
        const items = await Item.find().sort({ favoritesCount: -1 }).populate('ownerId').skip((page - 1) * size).limit(parseInt(size)).lean();

        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '获取最多收藏的物品列表成功', status: true });
    } catch (err) {
        res.json({ msg: '获取最多收藏的物品列表失败', status: false });
    }
});

// 获取最多浏览的物品列表(分页查询)
itemRouter.post('/most_views_items', async (req, res) => {
    try {
        const { page = 1, size = 10 } = req.body;
        const items = await Item.find().sort({ views: -1 }).populate('ownerId').skip((page - 1) * size).limit(parseInt(size)).lean();

        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '获取最多浏览的物品列表成功', status: true });
    } catch (err) {
        res.json({ msg: '获取最多浏览的物品列表失败', status: false });
    }
});

// 获取最多收藏(前3个)和最多浏览的物品列表(前3个)
itemRouter.get('/ranking_list', async (req, res) => {
    try {
        const favoritesItems = await Item.find().sort({ favoritesCount: -1 }).limit(3).populate('ownerId').lean();
        const viewsItems = await Item.find().sort({ views: -1 }).limit(3).populate('ownerId').lean();
        // 将ownerId字段改为owner
        const modifiedFavoritesItems = favoritesItems.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        const modifiedViewsItems = viewsItems.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ favoritesItems: modifiedFavoritesItems, viewsItems: modifiedViewsItems, msg: '获取排行榜成功', status: true });
    } catch (err) {
        res.json({ msg: '获取排行榜失败', status: false });
    }
});

// 发布物品
itemRouter.post('/publish', async (req, res) => {
    try {
        const { name, price, description, category, images, ownerId, status, location, isNegotiable } = req.body;

        // 创建物品
        const item = new Item({
            name, price, description, category, images, ownerId, status, location, isNegotiable
        });

        await item.save();

        res.json({ item, msg: '物品发布成功', status: true });
    } catch (err) {
        res.json({ msg: '物品发布失败', status: false });
    }
});

// 用户收藏物品，收藏数+1
itemRouter.post('/favorite', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.userId;

        // 1. 检查用户是否已经收藏该物品
        const existingFavorite = await Favorite.exists({ userId, itemId });
        if (existingFavorite) {
            return res.json({ msg: '你已经收藏过该物品了', status: false });
        }

        // 2. 更新物品的收藏数 +1
        await Item.findByIdAndUpdate(
            itemId,
            { $inc: { favoritesCount: 1 } }, // 收藏数加 1
            { timestamps: false } // 禁用 timestamps 更新
        );

        // 3. 保存新的 favorite 记录
        const newFavorite = new Favorite({ userId, itemId });
        await newFavorite.save();

        res.json({ msg: '收藏成功', status: true });
    } catch (err) {
        res.json({ msg: '收藏失败', status: false });
    }
});

// 用户取消收藏物品，收藏数-1
itemRouter.post('/unFavorite', authMiddleware, async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.userId;

        // 1. 删除 Favorite 集合中的收藏记录
        await Favorite.findOneAndDelete({ userId, itemId });

        // 2. 更新物品的收藏数 -1
        await Item.findByIdAndUpdate(
            itemId,
            { $inc: { favoritesCount: -1 } },
            { timestamps: false }
        );

        res.json({ msg: '取消收藏成功', status: true });
    } catch (err) {
        res.json({ msg: '取消收藏失败', status: false });
    }
});

// 收藏列表
itemRouter.post('/favorites', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, size = 10 } = req.body;
        const favorites = await Favorite.find({ userId }).sort({ _id: -1 }).populate({
            path: 'itemId',
            populate: { path: 'ownerId' }
        }).skip((page - 1) * size).limit(parseInt(size)).lean();

        // 将itemId字段改为item 以及 将ownerId字段改为owner
        const modifiedFavorites = favorites.map(favorite => {
            if (favorite.itemId) {
                favorite.item = favorite.itemId;
                favorite.item.owner = favorite.itemId.ownerId || null;
                delete favorite.itemId;
                if (favorite.item.owner) {
                    delete favorite.item.ownerId;
                }
            }
            return favorite;
        });

        res.json({ favorites: modifiedFavorites, msg: '获取收藏列表成功', status: true });
    } catch (err) {
        console.error(err); // 打印错误日志以便调试
        res.json({ msg: '获取收藏列表失败', status: false });
    }
});

// 用户进入物品详情页，浏览数+1
itemRouter.post('/view', async (req, res) => {
    try {
        const { itemId } = req.body;

        // 使用 $inc 增加 views，并禁用 timestamps 更新
        await Item.findByIdAndUpdate(
            itemId,
            { $inc: { views: 1 } }, // views 加 1
            { timestamps: false } // 禁用 timestamps 更新
        );

        res.json({ msg: '浏览数+1成功', status: true });
    } catch (err) {
        res.json({ msg: '浏览数+1失败', status: false });
    }
});

// 删除物品
itemRouter.post('/delete', async (req, res) => {
    try {
        const { itemId } = req.body;

        await Item.findByIdAndDelete(itemId);

        res.json({ msg: '物品删除成功', status: true });
    } catch (err) {
        res.json({ msg: '物品删除失败', status: false });
    }
});

// 模糊搜索物品
itemRouter.post('/search', async (req, res) => {
    try {
        const { keyword } = req.body;
        const items = await Item.find({ name: { $regex: keyword, $options: 'i' } }).populate('ownerId').lean();
        // 将ownerId字段改为owner
        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '模糊搜索物品成功', status: true });
    } catch (err) {
        res.json({ msg: '模糊搜索物品失败', status: false });
    }
});

module.exports = itemRouter;





