const express = require('express');
const router = express.Router();
const { calculate, getInfo } = require('../controllers/calculatorController'); // Импорт контроллера

router.post('/', calculate); // Обработка POST-запроса
router.get('/serv/info.json', getInfo); // Обработка POST-запроса

module.exports = router;
