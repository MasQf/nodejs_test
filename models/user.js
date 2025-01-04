const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
            },
            message: `Is not a valid email`
        },
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                return /^(?=.*\d)(?=.*[a-z]).{6,}$/.test(value)
            },
            message: `Password must be at least 6 characters long, including lowercase letters, and numbers`
        },
    },
    state: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
})

const User = mongoose.model('User', userSchema)

module.exports = User