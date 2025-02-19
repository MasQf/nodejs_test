const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try {
        // 从请求头中获取 token
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ msg: 'Access Denied. No token provided.', status: false });
        }

        // 验证 token
        const decoded = jwt.verify(token, 'passwordKey');
        if (!decoded) {
            return res.status(401).json({ msg: 'Invalid token', status: false });
        }

        // 从 token 中获取 userId 并查询用户
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found', status: false });
        }

        // 将 userId 和用户信息存入 req 对象
        req.userId = user._id.toString();
        req.user = user;

        // 继续执行下一个中间件或路由处理函数
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Invalid token', status: false });
    }
};

module.exports = authMiddleware;