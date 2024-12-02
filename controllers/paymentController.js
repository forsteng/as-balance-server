const WAYFORPAY_MERCHANT_ID = process.env.WAYFORPAY_MERCHANT_ID;
const WAYFORPAY_SECRET_KEY = process.env.WAYFORPAY_SECRET_KEY;
const wayForPayApi = process.env.WAYFORPAY_URL;

// Инициализация WayForPay
const WayForPay = require('../models/WayForPay.js')( {
  account: WAYFORPAY_MERCHANT_ID,
  secret: WAYFORPAY_SECRET_KEY,
  apiUrl: wayForPayApi
});

const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const crypto = require('crypto');
const axios = require('axios');

// Обработка платежа
exports.payment = async (req, res) => {
  try {
    const { orderReference, amount, currency, products, userId } = req.body;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userObjectId);

    // Подготовка заказа
    const order = {
        id: orderReference,
        items: products.map(product => ({
        product_name: String(product.name), // Убедитесь, что это строка
        price: Number(product.price), // Убедитесь, что это число
        count: Math.max(1, Number(product.quantity)) // Убедитесь, что это положительное целое число
        })),
        amount,
        currency,
        domain: 'localhost:3000', // Укажите ваш домен
        serviceUrl: 'http://localhost:5005/wayforpay/confirm-payment',
        paymentSystems: 'googlePay;applePay;card',
        clientFirstName: user?.name,
        clientLastName: user?.surname,
        clientEmail: user?.email,
        clientPhone: user?.phone
    };

    // Создаем новый заказ
    const newOrder = new Order({
      orderId: orderReference,
      products: products.map(product => ({
          productId: new mongoose.Types.ObjectId(product.id), // Предполагаем, что здесь хранится ID продукта
          title: product.name,
          price: product.price, // Убедитесь, что вы передаете правильное значение
          quantity: product.quantity, // И тоже проверьте это поле
          imageURL: product.imageURL,
          type: product.type
        }))
    });
    user.orders.push(orderReference);
    await user.save();

    // Сохраняем заказ в базе данных
    await newOrder.save();

    // Отправка запроса на оплату
    const invoiceResponse = await WayForPay.prepareInvoice(order);
    
    if (!invoiceResponse.data || invoiceResponse.data.reasonCode > 1100) {
        throw new Error(
          `Invoice error: [${data.reasonCode}] ${data.reason}`
        );
      }

    if (invoiceResponse.data && invoiceResponse.data.invoiceUrl) {
      return res.status(200).json({ success: true, url: invoiceResponse.data.invoiceUrl });
    } else {
      return res.status(400).json({ success: false, message: 'Ошибка в платёжной системе' });
    }
  } catch (error) {
    console.error('Ошибка при инициализации платежа:', error);
    res.status(500).json({ success: false, message: 'Ошибка при создании платежа' });
  }
};

// Подтверждение платежа
exports.confirmPayment = async (req, res) => {
    try {
        const reqBody = JSON.parse(req.rawBody);
        console.log('reqBody', reqBody);

        // Проверяем статус транзакции
        if (reqBody.transactionStatus === 'Approved') {
            const { orderReference } = reqBody; // Извлекаем orderReference для поиска заказа

            // Находим заказ по orderId
            const order = await Order.findOne({ orderId: orderReference });

            if (!order) {
                return res.status(404).send('Заказ не найден');
            }

            // Обновляем статус заказа
            order.isApproved = true;
            await order.save();

            console.log('Статус заказа обновлен:', order);
            return res.status(200).send('<h1>Спасибо за покупку</h1><a href="http://localhost:3000/order-successt">Перейти в профиль</a>');
        } else {
            return res.status(400).send('Ошибка оплаты');
        }
    } catch (error) {
        console.error('Ошибка при подтверждении платежа:', error);
        res.status(500).send('Внутренняя ошибка сервера');
    }
};



















exports.tmpCreatePayment = async (req, res) => {
  try {
          const { orderReference, amount, currency, products, userId } = req.body;
          const userObjectId = new mongoose.Types.ObjectId(userId);
          const user = await User.findById(userObjectId);
          console.log(products);

          // Создаем новый заказ
          const newOrder = new Order({
            orderId: orderReference,
            products: products.map(product => ({
                productId: new mongoose.Types.ObjectId(product.id), // Предполагаем, что здесь хранится ID продукта
                title: product.name,
                price: product.price, // Убедитесь, что вы передаете правильное значение
                quantity: product.quantity, // И тоже проверьте это поле
                imageURL: product.imageURL,
                type: product.type
            }))
        });
        user.orders.push(orderReference);
        await user.save();

          // Сохраняем заказ в базе данных
          await newOrder.save();

          fetch(`http://localhost:5005/wayforpay/tmp-confirm-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({orderReference: orderReference}),
          });
          
          return res.status(200).send({success: true});
     
  } catch (error) {
      console.error('Ошибка при подтверждении платежа:', error);
      res.status(500).send('Внутренняя ошибка сервера');
  }
};
// Подтверждение платежа
exports.tmpConfirmPayment = async (req, res) => {
  try {
          const { orderReference} = req.body;
          // Находим заказ по orderId
          const order = await Order.findOne({ orderId: orderReference });

          if (!order) {
              return res.status(404).send('Заказ не найден');
          }

          // Обновляем статус заказа
          order.isApproved = true;
          await order.save();

          sendOrderEmail(orderReference);

          console.log('Статус заказа обновлен:', order);
          return res.status(200).send({success: true});
     
  } catch (error) {
      console.error('Ошибка при подтверждении платежа:', error);
      res.status(500).send('Внутренняя ошибка сервера');
  }
};


const senderEmail = process.env.EMAIL;
const mail_key = process.env.MAIL_KEY;

var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = mail_key;

const sendOrderEmail = async (orderReference) => {
  try {
    // Найти пользователя по номеру заказа
    const user = await User.findOne({ orders: { $in: [orderReference] } });
    if (!user) {
      throw new Error("Пользователь с таким заказом не найден.");
    }

    // Найти заказ по orderId
    const order = await Order.findOne({ orderId: orderReference });
    if (!order) {
      throw new Error("Заказ не найден.");
    }

    // Сформировать список продуктов для письма
    const productsHTML = order.products.map(product => `
      <div>
        <strong>${product.title}</strong>  
        <img src="${product.imageURL}" alt="${product.title}" style="max-width: 200px; height: auto;" /> 
        <p>Ціна: ${product.price} грн</p>
        <p>Кількість: ${product.quantity}</p>
      </div>
      <hr>
    `).join('');

    // Настроить отправку письма
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 

    sendSmtpEmail = {
      sender: {
        email: senderEmail // Убедитесь, что senderEmail объявлена ранее
      },
      to: [{
        email: user.email,
      }],
      subject: "Ваше замовлення",
      htmlContent: `
        <h2>Дякуємо за замовлення!</h2>
        <p>Номер замовлення: <strong>${orderReference}</strong></p>
        <p>Дата замовлення: ${new Date(order.date).toLocaleDateString()}</p>
        <hr>
        <h3>Деталі замовлення:</h3>
        ${productsHTML}
        <hr>
        <p>Загальна сума: <strong>${order.products.reduce((sum, product) => sum + product.price * product.quantity, 0)} грн</strong></p>
      `
    };

    // Отправить письмо
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Письмо успешно отправлено:", response);
  } catch (error) {
    console.error("Ошибка при отправке письма:", error);
  }
};






exports.tmpCreatePaymentCalc = async (req, res) => {
  try {
          const { orderReference, price, type, userId } = req.body;
          const userObjectId = new mongoose.Types.ObjectId(userId);
          const user = await User.findById(userObjectId);
          
          // Создаем новый заказ
          const newSubscription = new Subscription({
            orderId: orderReference,
            subscriptionCalc: 
            {
                type: Number(type)
            },
          });
          user.subscription = orderReference;
          await user.save();
 
          // Сохраняем заказ в базе данных
          await newSubscription.save();

          fetch(`http://localhost:5005/wayforpay/tmp-confirm-payment-calc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({orderReference: orderReference}),
          });
          
          return res.status(200).send({success: true});
     
  } catch (error) {
      console.error('Ошибка при подтверждении платежа:', error);
      res.status(500).send('Внутренняя ошибка сервера');
  }
};
exports.tmpConfirmPaymentCalc = async (req, res) => {
  try {
          const { orderReference} = req.body;
          const now = new Date();
          // Находим заказ по orderId
          const subscription = await Subscription.findOne({ orderId: orderReference });

          if (!subscription) {
              return res.status(404).send('Заказ не найден');
          }

          if(subscription.subscriptionCalc.type == 2){
            subscription.subscriptionCalc.startDate =  Math.floor(now.getTime() / 1000);
            subscription.subscriptionCalc.endDate = Math.floor(new Date(now.setMonth(now.getMonth() + 3)).getTime() / 1000);;
          }
          else if(subscription.subscriptionCalc.type == 3){
            subscription.subscriptionCalc.startDate = Math.floor(now.getTime() / 1000);
            subscription.subscriptionCalc.endDate = Math.floor(new Date(now.setMonth(now.getMonth() + 6)).getTime() / 1000);;
          }

          // Обновляем статус заказа
          subscription.isApproved = true;
          await subscription.save();

          console.log('Подписка успешно оформлена!', subscription);
          return res.status(200).send({success: true});
     
  } catch (error) {
      console.error('Ошибка при подтверждении платежа:', error);
      res.status(500).send('Внутренняя ошибка сервера');
  }
};