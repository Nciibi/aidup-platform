const mongoose = require('mongoose');
const { Schema } = mongoose;

const orgverificationSchema = new Schema({
    organizer_id: {
        type: Schema.Types.ObjectId,
        ref: 'organizer'
    },
    images: [{
        type: String,
        required: true
    }],
    name: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected','not_submitted'],
        default: 'not_submitted'
    },
    reviewed_by_admin: {
        type: Schema.Types.ObjectId,
        ref: 'admin'
    },
    review_comments: {
        type: String,
        default: ''
    },
    review_date: {
        type: Date
    },
    submitted_date: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: { virtuals: true }
});

module.exports = mongoose.model('orgverification', orgverificationSchema);