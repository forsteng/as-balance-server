const Order = require('../models/Order'); // Импорт модели Order
const User = require('../models/User');   // Импорт модели User
const Product = require('../models/Product'); // Импорт модели Product
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');



// Получение всех продуктов, заказанных пользователем
exports.getAllProducts = async (req, res) => {
    try {
        const { userId } = req.body;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Находим пользователя по его ID
        const user = await User.findById(userObjectId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Получаем массив заказов пользователя
        const userOrders = user.orders;
        if (userOrders.length === 0) {
            return res.status(200).json({ message: 'У вас нет заказов' });
        }

        // Находим все заказы пользователя в базе данных
        const orders = await Order.find({ orderId: { $in: userOrders } });

        // Фильтруем заказы по статусу isApproved
        const approvedOrders = orders.filter(order => order.isApproved);

        // Извлекаем уникальные идентификаторы продуктов
        const productIds = approvedOrders.flatMap(order => 
            order.products.map(product => product.productId)
        );

        // Получаем все уникальные продукты с типом 1
        const productsDetails = await Product.find({
            _id: { $in: productIds },
            type: 1
        }).select('-fileURL'); // Исключаем fileURL

        // Создаем объект для быстрого доступа к деталям продуктов
        const productDetailsMap = productsDetails.reduce((map, product) => {
            map[product._id] = product;
            return map;
        }, {});

        // Извлекаем продукты из всех одобренных заказов
        const products = [];
        for (const order of approvedOrders) {
            for (const product of order.products) {
                const productDetails = productDetailsMap[product.productId]; // Используем объект для быстрого доступа
                if (productDetails) {
                    products.push({
                        productId: productDetails._id,
                        title: productDetails.title,
                        price: productDetails.price,
                        imageURL: productDetails.imageURL,
                        quantity: product.quantity,
                        // fileURL доступен только для продуктов с типом 1
                        fileURL: productDetails.fileURL,
                    });
                }
            }
        }

        console.log('products', products);
        
        // Если одобренных заказов нет
        if (products.length === 0) {
            return res.status(200).json({ message: 'Нет оплаченных заказов' });
        }

        // Возвращаем список продуктов пользователю
        res.status(200).json({ products });
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getSubscription = async (req, res) => {
    try {
        const { userId } = req.body;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Находим пользователя по его ID
        const user = await User.findById(userObjectId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Получаем массив заказов пользователя
        const userSubscription = user.subscription;
        if (!userSubscription) {
            return res.status(200).json({ message: 'У вас нет подписок' });
        }

        // Находим все заказы пользователя в базе данных
        const subscriptions = await Subscription.find({ orderId: { $in: userSubscription } });

        // Фильтруем заказы по статусу isApproved
        const approvedSubscriptions = subscriptions.filter(sub => sub.isApproved);

        // Извлекаем продукты из всех одобренных заказов
        let subs = {}; // Изменено на let
        for (const sub of approvedSubscriptions) {
            subs = sub.subscriptionCalc; // Теперь можно изменять subs
        }

        console.log('subs', subs)
        // Если одобренных заказов нет
        if (!subs || Object.keys(subs).length === 0) {
            return res.status(200).json({ message: 'Нет оплаченных подписок' });
        }

        // Возвращаем список продуктов пользователю
        res.status(200).json({ subs });
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


exports.removeSubscription = async (req, res) => {
    try {
        const { userId } = req.body; // Добавляем orderId в теле запроса
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Находим пользователя по его ID
        const user = await User.findById(userObjectId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Удаляем подписку из таблицы подписок
        const subscription = await Subscription.findOneAndDelete({ orderId: user.subscription });
        if (!subscription) {
            return res.status(404).json({ message: 'Подписка не найдена в базе данных' });
        }

        // Удаляем orderId из массива подписок пользователя
        user.subscription = "";
        await user.save(); // Сохраняем изменения у пользователя

        res.status(200).json({ message: 'Подписка успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении подписки:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


exports.getAllOrdersId = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Находим пользователя по его ID
        const user = await User.findOne({ orders: orderId });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Получаем массив заказов пользователя
        const userOrders = user.orders;
        if (userOrders.length === 0) {
            return res.status(200).json({ message: 'У вас нет заказов' });
        }

        // Находим все заказы пользователя в базе данных
        const orders = await Order.find({ orderId: { $in: userOrders } });

        // Фильтруем заказы по статусу isApproved
        const approvedOrders = orders.filter(order => order.isApproved);

        // Извлекаем уникальные идентификаторы продуктов
        const productIds = approvedOrders.flatMap(order => 
            order.products.map(product => product.productId)
        );

        // Получаем все уникальные продукты с типом 1
        const productsDetails = await Product.find({
            _id: { $in: productIds },
            type: 2
        }).select('-fileURL'); // Исключаем fileURL

        // Создаем объект для быстрого доступа к деталям продуктов
        const productDetailsMap = productsDetails.reduce((map, product) => {
            map[product._id] = product;
            return map;
        }, {});

        // Извлекаем продукты из всех одобренных заказов
        const products = [];
        for (const order of approvedOrders) {
            for (const product of order.products) {
                const productDetails = productDetailsMap[product.productId]; // Используем объект для быстрого доступа
                if (productDetails) {
                    products.push({
                        productId: productDetails._id,
                        title: productDetails.title,
                        price: productDetails.price,
                        imageURL: productDetails.imageURL,
                        quantity: product.quantity,
                        // fileURL доступен только для продуктов с типом 1
                        fileURL: productDetails.fileURL,
                    });
                }
            }
        }

        console.log('products', products);
        
        // Если одобренных заказов нет
        if (products.length === 0) {
            return res.status(200).json({ message: 'Нет оплаченных заказов' });
        }

        // Возвращаем список продуктов пользователю
        res.status(200).json({ products });
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findOne({ orderId: orderId });
        // Извлекаем уникальные идентификаторы продуктов
        const productIds = order.products.map(product => product.productId);

        // Получаем все уникальные продукты с типом 1
        const productsDetails = await Product.find({
            _id: { $in: productIds },
            type: 2
        }).select('-fileURL'); // Исключаем fileURL

        // Создаем объект для быстрого доступа к деталям продуктов
        const productDetailsMap = productsDetails.reduce((map, product) => {
            map[product._id] = product;
            return map;
        }, {});

        // Извлекаем продукты из всех одобренных заказов
        const products = [];
            for (const product of order.products) {
                const productDetails = productDetailsMap[product.productId]; // Используем объект для быстрого доступа
                if (productDetails) {
                    products.push({
                        productId: productDetails._id,
                        title: productDetails.title,
                        price: productDetails.price,
                        imageURL: productDetails.imageURL,
                        quantity: product.quantity,
                        // fileURL доступен только для продуктов с типом 1
                        fileURL: productDetails.fileURL,
                    });
                }
            }

        console.log('products', products);
        
        // Если одобренных заказов нет
        if (products.length === 0) {
            return res.status(200).json({ message: 'Нет оплаченных заказов' });
        }

        // Возвращаем список продуктов пользователю
        res.status(200).json({ products });
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};