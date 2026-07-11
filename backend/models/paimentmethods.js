const mongoose = require('mongoose');
const { Schema } = mongoose;

const paimentmethodSchema = new Schema({
    method_type: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('paimentmethod', paimentmethodSchema);