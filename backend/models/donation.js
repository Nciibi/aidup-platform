const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    donator_id: { type: Schema.Types.ObjectId, ref: 'donator' },

    campaign_id: { type: Schema.Types.ObjectId, ref: 'campaign' },

    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

    reviewed_by_admin: { type: Schema.Types.ObjectId, ref: 'admin' },

    review_comments: { type: String},

    review_date: { type: Date },

    submitted_date: { type: Date },

    evidance: [{ type: String, required: true }],

    paiment_method: [{
        method_type: { type: String },
        details: { type: String }
    }],
    description: { type: String },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('donation', userSchema);