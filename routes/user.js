const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userRouter = express.Router()

userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body

        // 校验输入是否完整
        if (!name || !email || !password) {
            return res.json({ msg: 'Missing required fields', status: false });
        }

        // 验证密码格式
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.json({
                msg: 'Password must be at least 8 characters long, including uppercase, lowercase letters, and numbers',
                status: false
            });
        }

        // 验证邮箱格式
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.json({ msg: 'Invalid email format', status: false });
        }

        // 验证邮箱是否存在
        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.json({ msg: 'Email already has been registered', status: false })
        } else {
            // Hash the password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            const user = new User({ name, email, password: hashedPassword })
            await user.save()
            res.status(200).json({ msg: 'User created successfully', status: true })
        }
    } catch (e) {
        res.status(500).json({ msg: e.msg })
    }
})

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
                const token = jwt.sign({ _id: user._id }, "passwordKey")
                // 返回token和不包含密码的用户信息
                res.status(200).json({ token, data: { name: user.name, email: user.email }, msg: 'Login successfully', status: true })
            }
        }
    } catch (e) {
        res.status(500).json({ msg: e.message })
    }
})

module.exports = userRouter