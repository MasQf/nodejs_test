//聊天列表接口
const express = require('express');
const chatRouter = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');
const Message = require('../models/message');

// 获取聊天列表
chatRouter.post('/chat_list', async (req, res) => {
    try {
        const { userId } = req.body;

        // 查找与当前用户相关的聊天列表
        const chatList = await Chat.find({ participants: userId })
            .sort({ 'lastMessage.time': -1 }) // 按最后消息时间排序
            .populate('lastMessage') // 填充 lastMessage 字段
            .select({
                roomId: 1,
                participants: 1,
                lastMessage: 1, // 你可以选择包含哪些字段
                unreadCount: 1,
            })
            .lean();

        // 添加 targetUser 字段，包含对方用户的信息
        for (let chat of chatList) {
            // 获取 participants 数组中不等于 userId 的 ID，即对方用户的 ID
            const targetUserId = chat.participants.find(id => id !== userId);

            // 查询对方用户的详细信息
            const targetUser = await User.findById(targetUserId).lean();

            // 将 targetUser 添加到 chat 对象中
            chat.targetUser = targetUser;
        }

        res.json({ chatList, msg: '获取聊天列表成功', status: true });
    } catch (err) {
        res.status(500).json({ msg: '获取聊天列表失败', error: err.message });
    }
});

// 获取聊天详情
chatRouter.post('/chat_detail', async (req, res) => {
    try {
        const { roomId } = req.body;

        // 查找指定 roomId 的聊天记录
        const messages = await Message.find({ roomId }).sort({ time: 1 });


        if (!messages) {
            return res.status(404).json({ msg: '聊天房间不存在', status: false });
        }

        // 返回聊天房间详细信息，包括消息记录
        res.json({
            messages,
            msg: '获取聊天详情成功',
            status: true
        });
    } catch (err) {
        res.status(500).json({ msg: '获取聊天详情失败', error: err.message });
    }
});


module.exports = chatRouter;