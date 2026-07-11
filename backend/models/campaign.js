const mongoose = require('mongoose');
const { Schema } = mongoose;

const campaignSchema = new Schema({
    organizer_id: {
        type: Schema.Types.ObjectId,
        ref: 'organizer'
    },

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    story: {
        type: String,
        required: true
    },
    goal:[{
        type: String,
        required: true
    }],
    goal_amount: {
        type: Number,
        required: true
    },
    raised_amount:{
        type: Number,
        default: 0
    },
    images: [{
        type: String,
        required: true
    }],
    banner:{
        type: String,
        required: true
    },

    videos: [{
        type: String
    }],

    paiment_methods: [{
        method_type: {
            type: String,
            required: true
        },
        details: {
            type: String,
            required: true
        }
    }],
    
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },

     approved_at: {
        type: Date, 
    },
    rejected_at: {
        type: Date,
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
    goal_date:{
        type: Date,
        required: true
    }
    
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: { virtuals: true }
});

module.exports = mongoose.model('campaign', campaignSchema);