// 订单接口

// 用户发起交易创建订单，订单状态为待交易Pending，每个订单有一个唯一的订单号orderId、卖家user、买家user、商品item、交易地点、订单状态status
const express = require('express');
const tradeRouter = express.Router();
const Trade = require('../models/trade');
const Item = require('../models/item');
const User = require('../models/user');

// 创建订单
tradeRouter.post('/create_trade', async (req, res) => {
    const { sellerId, buyerId, itemId, location, tradeTime } = req.body;
    try {
        // 验证用户或商品是否存在
        const seller = await User.findById(sellerId);
        const buyer = await User.findById(buyerId);
        const item = await Item.findById(itemId);
        if (!seller || !buyer || !item) {
            return res.status(400).json({ message: 'Seller or Buyer or Item not found' });
        }

        // 创建订单
        const trade = new Trade({
            sellerId,
            buyerId,
            itemId,
            location,
            tradeTime,
            status: 'Pending'
        });

        await trade.save();
        res.json({ trade: trade, msg: '创建交易成功', status: true });
    } catch (error) {
        res.json({ message: error.message, status: false });
    }
});

// 根据sellerId获取卖出交易列表,post一个sellerId请求,可以根据status筛选,如果不传status则获取所有交易列表
// status有Pending、Completed、Cancelled
tradeRouter.post('/sell_list', async (req, res) => {
    const { sellerId, status } = req.body;
    try {
        const query = { sellerId };
        if (status) {
            query.status = status;
        }
        const trades = await Trade.find(query).lean(); // Use .lean() to allow modification of the result objects

        // 根据trades中的itemId查询物品信息，只返回images、name、price字段
        const itemIds = trades.map(trade => trade.itemId);
        const items = await Item.find({ _id: { $in: itemIds } }, 'images name price').lean();

        // 根据trades中的buyerId查询用户信息
        const buyerIds = trades.map(trade => trade.buyerId);
        const buyers = await User.find({ _id: { $in: buyerIds } }).lean();

        // 将物品信息和用户信息添加到交易记录中
        trades.forEach(trade => {
            trade.item = items.find(item => item._id.toString() === trade.itemId.toString()) || null;
            trade.buyer = buyers.find(user => user._id.toString() === trade.buyerId.toString()) || null;

            // 删除不需要的字段
            delete trade.itemId;
            delete trade.buyerId;
        });

        res.json({ trades: trades, msg: '获取卖出交易列表成功', status: true });
    } catch (error) {
        res.json({ message: '获取卖出交易列表失败', status: false });
    }
});

// 根据buyerId获取买入交易列表,post一个buyerId请求,可以根据status筛选,如果不传status则获取所有交易列表
// status有Pending、Completed、Cancelled
tradeRouter.post('/buy_list', async (req, res) => {
    const { buyerId, status } = req.body;
    try {
        const query = { buyerId };
        if (status) {
            query.status = status;
        }
        const trades = await Trade.find(query).lean(); // Use .lean() to allow modification of the result objects

        // 根据trades中的itemId查询物品信息
        const itemIds = trades.map(trade => trade.itemId);
        const items = await Item.find({ _id: { $in: itemIds } }, 'images name price').lean();

        // 根据trades中的sellerId查询用户信息
        const sellerIds = trades.map(trade => trade.sellerId);
        const sellers = await User.find({ _id: { $in: sellerIds } }).lean();

        // 将物品信息和用户信息添加到交易记录中
        trades.forEach(trade => {
            trade.item = items.find(item => item._id.toString() === trade.itemId.toString()) || null;
            trade.seller = sellers.find(user => user._id.toString() === trade.sellerId.toString()) || null;

            // 删除不需要的字段
            delete trade.itemId;
            delete trade.sellerId;
        });

        res.json({ trades: trades, msg: '获取买入交易列表成功', status: true });
    } catch (error) {
        res.json({ message: '获取买入交易列表失败', status: false });
    }
});

// 更新交易状态
tradeRouter.post('/update_trade_status', async (req, res) => {
    const { tradeId, status } = req.body;
    try {
        // 更新交易状态
        const trade = await Trade.findByIdAndUpdate(tradeId, { status }, { new: true });
        if (!trade) {
            return res.json({ message: 'Trade not found', status: false });
        }
        res.json({ trade: trade, msg: '更新交易状态成功', status: true });
    } catch (error) {
        res.json({ message: '更新交易状态失败', status: false });
    }
});

module.exports = tradeRouter;


