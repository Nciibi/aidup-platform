const mongoose = require('mongoose');
const { Schema } = mongoose;

const verificationCodeSchema = new Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Code expires after 10 minutes (MongoDB TTL index)
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: false
    },
    toObject: {
        virtuals: false
    }
});

verificationCodeSchema.set('toJSON', { getters: true });
verificationCodeSchema.set('toObject', { getters: true });

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
