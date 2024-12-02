// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    surname: { type: String, default: '' },
    birthdate: { type: Date, default: null },
    phone: { type: String, default: '' },
    orders: [{ type: String }],
    isSubscribed: { type: Boolean, default: true },
    role: { type: String, default: 'user' },
    subscription: { type: String },
});

module.exports = mongoose.model('User', userSchema);