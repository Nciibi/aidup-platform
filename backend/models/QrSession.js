const mongoose = require('mongoose');

const qrSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'authenticated', 'used', 'expired'],
        default: 'pending'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel', 
        default: null
    },
    userModel: {
        type: String,
        enum: ['donator', 'organizer', 'admin'],
        default: null
    },
    socketId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120 // Session documents automatically expire/delete after 2 minutes (120 seconds)
    }
});

// We can add an explicit expiresAt for easy polling/checking before the TTL job runs
qrSessionSchema.virtual('expiresAt').get(function() {
    return new Date(this.createdAt.getTime() + 120000); // +2 mins
});

qrSessionSchema.set('toJSON', { virtuals: true });
qrSessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('QrSession', qrSessionSchema);
