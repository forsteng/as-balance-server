const Cart = require('../models/Cart');
const mongoose = require('mongoose');
const Product = require('../models/Product'); // Модель товара
const User = require('../models/User'); 

exports.addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    // Проверка на наличие userId и productId
    if (!userId || !productId) {
        return res.status(400).json({ message: 'userId и productId обязательны.' });
    }

    try {
        // Преобразуем userId в ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const productObjectId = new mongoose.Types.ObjectId(productId); // Преобразуем productId в ObjectId

        // Проверяем, существует ли продукт
        const productExists = await Product.findById(productObjectId);
        if (!productExists) {
            return res.status(404).json({ message: 'Продукт не найден.' });
        }

        let cart = await Cart.findOne({ userId: userObjectId }); // Используем ObjectId для поиска

        if (cart) {
            // Если корзина уже существует, обновляем её
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productObjectId.toString());
            if (itemIndex > -1) {
                // Если товар уже есть в корзине, увеличиваем количество
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Если товара нет в корзине, добавляем его
                cart.items.push({ productId: productObjectId, quantity }); // productId как ObjectId
            }
        } else {
            // Если корзины нет, создаем новую
            cart = new Cart({
                userId: userObjectId, // Используем ObjectId для хранения
                items: [{ productId: productObjectId, quantity }],
            });
        }

        await cart.save();
        res.status(200).json({ message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};


// Получить корзину пользователя
exports.getCart = async (req, res) => {
    const  userId  = req.params.id; // Изменение: используем req.params для получения userId
    
    const userObjectId = new mongoose.Types.ObjectId(userId);

    try {
        // Используем populate для получения данных о продукте
        const cart = await Cart.findOne({ userId: userObjectId }).populate({
            path: 'items.productId', // Заполняем productId в items
            select: 'title price imageURL' // Указываем, какие поля хотим получить
        });

        if (cart) {
            res.json(cart);
        } else {
            res.json({ items: [] });
        }
    } catch (error) {
        console.error('Ошибка при получении корзины:', error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};

exports.updateCart = async (req, res) => {
    const { userId, productId, change } = req.body;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId); // Преобразуем productId в ObjectId

    try {
        // Найдите корзину пользователя по userId
        const cart = await Cart.findOne({ userId: userObjectId });

        if (!cart) {
            return res.status(404).json({ message: 'Корзина не найдена' });
        }

        // Найдите товар в корзине, используя его ID
        const product = cart.items.find(item => item.productId._id.equals(productObjectId));

        if (!product) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }

        // Обновите количество товара
        product.quantity += change;

        // Если количество товара меньше 1, удалите товар
        if (product.quantity <= 0) {
            cart.items = cart.items.filter(item => !item.productId._id.equals(productObjectId));
        }

        // Сохраните обновленную корзину
        await cart.save();

        res.json({ message: 'Корзина обновлена', cart });
    } catch (error) {
        console.error('Ошибка при обновлении корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

  

exports.deleteItem = async (req, res) => {
    const { userId, productId } = req.body;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId); // Преобразуем productId в ObjectId

  try {
    // Найдите корзину пользователя по userId
        const cart = await Cart.findOne({ userId: userObjectId });

    if (!cart) {
      return res.status(404).json({ message: 'Корзина не найдена' });
    }

    // Удалите товар из корзины
    cart.items = cart.items.filter(item => !item.productId._id.equals(productObjectId));

    // Сохраните обновленную корзину
    await cart.save();

    res.json({ message: 'Товар удален', cart });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};