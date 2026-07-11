const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: { virtuals: true }
});

module.exports = mongoose.model('category', categorySchema);