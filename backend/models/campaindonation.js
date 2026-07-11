const mongoose = require('mongoose');
const { Schema } = mongoose;

const campaindonationSchema = new Schema({
    campaign_id: {type: Schema.Types.ObjectId,ref: 'campaign'},

    donated_amount: {type: Number,default: 0},

    donations: [{type: Schema.Types.ObjectId,ref: 'donation'}],

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('campaindonation', campaindonationSchema);