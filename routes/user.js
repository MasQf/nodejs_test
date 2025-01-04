const express = require('express')
const User = require('../models/user')
const VerificationCode = require('../models/verification_code')
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

const userRouter = express.Router()

// 发送验证码
async function sendVerificationCode(email, code) {
    const transporter = nodemailer.createTransport({
        service: 'qq', // 使用 QQ 邮箱发送
        auth: {
            user: '2767987137@qq.com',
            pass: 'oklxbjjeprkodfjj', // 授权码
        },
    });
    const mailOptions = {
        from: '2767987137@qq.com',
        to: email,
        subject: '验证码-Verification Code',
        text: `${code}\n\n此验证码将在3分钟后过期。\nThis code will expire in 3 minutes.`,
    };

    await transporter.sendMail(mailOptions);
}

// 发送验证码接口
userRouter.post('/send_verification_code', async (req, res) => {
    try {
        const { email } = req.body;

        // 校验邮箱格式
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.json({ msg: 'Invalid email format', status: false });
        }

        // 生成6位数验证码
        const code = crypto.randomInt(100000, 999999).toString();

        // 设置验证码有效期（3分钟）
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 3 * 60 * 1000);

        // 在数据库中保存验证码
        const existingCode = await VerificationCode.findOne({ email });
        if (existingCode) {
            existingCode.code = code;
            existingCode.expiresAt = expiresAt;
            await existingCode.save();
        } else {
            const verificationCode = new VerificationCode({
                email,
                code,
                createdAt,
                expiresAt,
            });
            await verificationCode.save();
        }

        // 发送验证码到邮箱
        await sendVerificationCode(email, code);

        res.status(200).json({ verificationCode: { email, code, createdAt, expiresAt, }, msg: 'Verification code sent successfully', status: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Failed to send verification code', status: false });
    }
});

userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password, code } = req.body;

        // 校验输入是否完整
        if (!name || !email || !password || !code) {
            return res.json({ msg: 'Missing required fields', status: false });
        }

        // 校验密码格式
        const passwordRegex = /^(?=.*\d)(?=.*[a-z]).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.json({
                msg: 'Password must be at least 6 characters long, including lowercase letters and numbers.',
                status: false
            });
        }

        // 校验邮箱格式
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.json({ msg: 'Invalid email format', status: false });
        }

        // 校验验证码
        const verificationCode = await VerificationCode.findOne({ email });
        if (!verificationCode) {
            return res.json({ msg: 'Verification code not found.', status: false });
        }

        // 校验验证码是否正确
        if (verificationCode.code !== code) {
            return res.json({ msg: 'Invalid verification code.', status: false });
        }

        // 校验验证码是否过期
        if (new Date() > verificationCode.expiresAt) {
            return res.json({ msg: 'Verification code has expired.', status: false });
        }

        // 验证邮箱是否已经注册
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.json({ msg: 'Email already has been registered.', status: false });
        }

        // 哈希密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 保存用户到数据库
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // 注册成功后删除验证码记录（可选）
        await VerificationCode.deleteOne({ email });

        res.status(200).json({ msg: 'User created successfully.', status: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Server error.', status: false });
    }
});


userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ msg: 'Email is not registered', status: false })
        } else {
            const validPassword = await bcrypt.compare(password, user.password)
            if (!validPassword) {
                return res.json({ msg: 'Invalid password', status: false })
            } else {
                // token有效期为7天
                const token = jwt.sign({ _id: user._id }, 'passwordKey', { expiresIn: '7d' })
                // 返回token和不包含密码的用户信息
                res.status(200).json({ token, user: { name: user.name, email: user.email }, msg: 'Login successfully', status: true })
            }
        }
    } catch (e) {
        res.status(500).json({ msg: e.message })
    }
})

// 验证token是否有效接口
userRouter.post('/verify_token', async (req, res) => {
    const token = req.header('Authorization')
    if (!token) {
        return res.json({ msg: 'Access Denied', status: false })
    } else {
        try {
            const decoded = jwt.verify(token, 'passwordKey')
            if (decoded) {
                const user = await User.findById(decoded._id)
                // 刷新token有效期
                const newToken = jwt.sign({ _id: decoded._id }, 'passwordKey', { expiresIn: '7d' })
                // 返回token和用户信息
                res.json({ token: newToken, user: { name: user.name, email: user.email }, msg: 'Token is valid and refreshed', status: true })
            }
        } catch (e) {
            res.json({ msg: 'Invalid token', status: false })
        }
    }
})

// 重置密码接口
userRouter.post('/reset_password', async (req, res) => {
    try {
        const { email, code, password } = req.body;

        // 校验邮箱格式
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.json({ msg: 'Invalid email format', status: false });
        }

        // 校验密码格式
        const passwordRegex = /^(?=.*\d)(?=.*[a-z]).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.json({
                msg: 'Password must be at least 6 characters long, including lowercase letters, and numbers',
                status: false
            });
        }

        // 校验验证码
        const verificationCode = await VerificationCode.findOne({ email });
        if (!verificationCode || verificationCode.code !== code || verificationCode.expiresAt < Date.now()) {
            return res.json({ msg: 'Invalid verification code', status: false });
        }

        // 更新密码
        const user = await User.findOne({ email });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(200).json({ msg: 'Password reset successfully', status: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Failed to reset password', status: false });
    }
});



module.exports = userRouter