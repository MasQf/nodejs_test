// 发布物品接口
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

// 根据用户id获取物品列表
itemRouter.post('/items_by_user', async (req, res) => {
    try {
        const { userId } = req.body;
        const items = await Item.find({ ownerId: userId }).populate('ownerId').lean();
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

itemRouter.post('/items', async (req, res) => {
    try {
        const { userId } = req.body;
        const items = await Item.find({ ownerId: userId }).populate('ownerId').lean();
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

// 获取最多收藏的物品列表(前10个)
itemRouter.get('/popular_items', async (req, res) => {
    try {
        const items = await Item.find().sort({ favoriteCount: -1 }).limit(10);
        // 将ownerId字段改为owner
        const modifiedItems = items.map(item => {
            item.owner = item.ownerId;
            delete item.ownerId;
            return item;
        });
        res.json({ items: modifiedItems, msg: '获取最多收藏的物品列表成功', status: true });
    } catch (err) {
        res.status(500).json({ msg: '获取最多收藏的物品列表失败', status: false });
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





