const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Связываем с моделью пользователя
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // Связываем с моделью продукта
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
