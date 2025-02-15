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
        res.status(500).json({ msg: '获取物品列表失败', status: false });
    }
});

// 根据用户id获取 用户已发布的物品列表
itemRouter.post('/items_by_user', async (req, res) => {
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
        res.status(500).json({ msg: '根据用户id获取物品列表失败', status: false });
    }
});

// 获取最近发布的物品列表(前10个)
itemRouter.get('/recent_items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 }).limit(10).populate('ownerId').lean();
        // 将ownerId字段改为owner
        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '获取最近发布的物品列表成功', status: true });
    } catch (err) {
        res.status(500).json({ msg: '获取最近发布的物品列表失败', status: false });
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
        res.json({ favoritesItems: modifiedFavoritesItems, viewsItems: modifiedViewsItems, msg: '获取最多收藏和浏览的物品列表成功', status: true });
    } catch (err) {
        res.status(500).json({ msg: '获取最多收藏和浏览的物品列表失败', status: false });
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
        res.status(500).json({ msg: '物品发布失败', status: false });
    }
});

module.exports = itemRouter;





