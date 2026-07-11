const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Number
    },
    refreshTokens: [{
        type: String
    }],
    usedRefreshTokens: [{
        token: String,
        usedAt: { type: Date, default: Date.now }
    }],
    role: {
        type: String,
        default: 'ADMIN'
    },
    lastLogin: {
        type: Date
    },
    lastIp: {
        type: String
    },
    deviceInfo: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('admin', adminSchema);
