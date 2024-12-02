const express = require('express')
const path = require('path')
const app = express()
const port = 5005
const mongoose = require('mongoose');
require('dotenv').config();
const MONGO = process.env.MONGO;

const calculatorRoutes = require('./routes/calculator'); // Импорт роутов
const userRoutes = require('./routes/user'); // Импорт роутов
const courseRoutes = require('./routes/course'); // Импорт роутов
const productRoutes = require('./routes/product'); // Импорт роутов
const cartRoutes = require('./routes/cart'); // Импорт роутов
const paymentRoutes = require('./routes/payment'); // Импорт роутов
const orderRoutes = require('./routes/order'); // Импорт роутов

mongoose.connect(MONGO)
.then(() => console.log('MongoDB подключен'))
.catch(err => console.log('Ошибка подключения к MongoDB:', err));


app.use(express.json())

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
	next()
})

app.options('*', (req, res) => {
	res.sendStatus(200)
})

// Подключение роутов
app.use('/calculate', calculatorRoutes);
// Обработка регистрации
app.use('/user', userRoutes);
app.use('/course', courseRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);
app.use('/wayforpay', paymentRoutes);
app.use('/orders', orderRoutes);


app.get('/', (req, res) => {
	const filePath = path.join(__dirname, '..', 'index.html')
	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.status(500).send('Error loading index.html')
		} else {
			res.status(200).type('text/html').send(data)
		}
	})
})







app.listen(port, () => {
	console.log(`Server is running on ${port}`)
})
