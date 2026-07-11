const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: null
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
    phoneNumber: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    photo: {
        type: String,
        default: null
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
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
    mfaSecret: {
        type: String,
        default: ''
    },
    isMfaEnabled: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'donator'
    },
    lastLogin: {
        type: Date
    },
    lastIp: {
        type: String
    },
    deviceInfo: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isGoogleAuth: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('donator', userSchema);
