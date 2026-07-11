const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {type: String, required: true, trim: true},
    username: {type: String, required: true, trim: true},
    bio: {type: String, default: null},
    location: {type: String, default: null},
    website: {type: String, default: null},
    phone_number: {type: String, default: null},
    photo: {type: String, default: null},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    password: {type: String, required: true},
    old_password: {type: String, required: false},
    contactemail: {type: String, required: false},
    resetPasswordToken: {type: String, required: false},
    resetPasswordExpires: {type: Date, required: false},
    loginAttempts: {type: Number, required: true, default: 0},
    lockUntil: {type: Number},
    refreshTokens: [{type: String}],
    usedRefreshTokens: [{
        token: String,
        usedAt: { type: Date, default: Date.now }
    }],
    mfaSecret: {type: String, default: ''},
    isMfaEnabled: {type: Boolean, default: false},
    role: {type: String, default: 'organizer'},
    lastLogin: {type: Date},
    lastIp: {type: String},
    deviceInfo: {type: String},
    verification: {type: Schema.Types.ObjectId, ref: 'orgverification'},
    is_verified: {type: Boolean, default: false},
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
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            delete ret.loginAttempts;
            delete ret.lockUntil;
            delete ret.refreshTokens;
            delete ret.mfaSecret;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('organizer', userSchema);
