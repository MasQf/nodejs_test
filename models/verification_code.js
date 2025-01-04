const mongoose = require('mongoose')

const verificationCodeSchema = new mongoose.Schema({
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
    code: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
})

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema)

module.exports = VerificationCode