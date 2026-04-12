const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Property Title'],
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    min_price: {
        type: Number,
        default: 100000
    },
    max_price: {
        type: Number,
        default: 6000000000
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    bedrooms: {
        type: Number
    },
    image: {
        type: String,
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'rented'],
        default: 'available'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('property', propertySchema);
