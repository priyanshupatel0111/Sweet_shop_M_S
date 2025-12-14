const mongoose = require('mongoose');

const SweetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    }
});

module.exports = mongoose.model('Sweet', SweetSchema);
