//聊天列表接口

const express = require('express');
const Message = require('../models/message');
const chatRouter = express.Router();

// 获取聊天列表
chatRouter.post('/chat_list', async (req, res) => {
    try {
        //根据用户id获取对应的聊天列表
        const { userId } = req.body;
        const chatList = await Message.aggregate([
            { $match: { senderId: userId } },
            {
                $group: {
                    _id: '$roomId',
                    lastMessage: { $last: '$content' },
                    time: { $last: '$time' },
                },
            },
            { $sort: { time: -1 } },
        ]);

        res.json({ chatList });
    } catch (e) {
        res.status(500).send(e.message);
    }
});
