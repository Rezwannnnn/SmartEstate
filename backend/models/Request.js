const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'property',
        required: true
    },
    buyer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String }
    },
    seller: {
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);
