const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { type: String, default: null },
    imageURL: { type: String, default: null },
    fileURL: { type: String, default: null },
    type: {type: Number, default: null, required: true},
    category: { type: String, default: null },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
