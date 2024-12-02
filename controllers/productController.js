const Product = require('../models/Product'); // Модель товара

// Маршрут для получения всех товаров
exports.getAllProducts = async (req, res) => {
    try {
        const { type } = req.body;
        const products = await Product.find({ type: Number(type) }).select('-fileURL');
        res.json(products);
    } catch (error) {
        console.error("Ошибка при получении товаров:", error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};

// Маршрут для получения конкретного товара по ID
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id; // Получение ID из параметров запроса
        const product = await Product.findById(productId).select('-fileURL'); 

        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' }); // Если товар не найден
        }

        res.json(product); // Возврат найденного товара
    } catch (error) {
        console.error("Ошибка при получении товара:", error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};
