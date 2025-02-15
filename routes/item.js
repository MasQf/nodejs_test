// 物品相关接口
const express = require('express');
const itemRouter = express.Router();
const Item = require('../models/item');

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
itemRouter.post('/item_detail', async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = await Item.findById(itemId).populate('ownerId').lean();
        // 将ownerId字段改为owner
        item.owner = item.ownerId;
        delete item.ownerId;
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

// 获取最近发布的物品列表(分页查询,默认page从1开始，pageSize默认值为10)
itemRouter.get('/latest_items', async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const items = await Item.find().populate('ownerId').sort({ _id: -1 }).skip((page - 1) * pageSize).limit(parseInt(pageSize)).lean();

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
itemRouter.get('/favorites_items', async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const items = await Item.find().sort({ favoritesCount: -1 }).populate('ownerId').skip((page - 1) * pageSize).limit(parseInt(pageSize)).lean();

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
itemRouter.get('/views_items', async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const items = await Item.find().sort({ views: -1 }).populate('ownerId').skip((page - 1) * pageSize).limit(parseInt(pageSize)).lean();

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

// 用户进入物品详情页，浏览数+1
itemRouter.post('/view', async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = await Item.findById(itemId);
        item.views++;
        await item.save();
        res.json({ msg: '浏览数+1', status: true });
    } catch (err) {
        res.json({ msg: '浏览数+1失败', status: false });
    }
});

module.exports = itemRouter;





