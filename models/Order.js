const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            title: String,
            price: Number,
            quantity: Number,
            imageURL: String,
        },
    ],
    isApproved: {type: Boolean, default: false},
    date: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
