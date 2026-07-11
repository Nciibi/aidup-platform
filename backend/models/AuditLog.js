const mongoose = require('mongoose');

const auditlogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // May be null for some actions
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: false,
        enum: ['admin', 'donator', 'organizer']
    },
    action: {
        type: String,
        required: true
    },
    resource: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    status: {
        type: Number, // HTTP status code
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

module.exports = mongoose.model('auditlog', auditlogSchema);
