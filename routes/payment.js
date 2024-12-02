const express = require('express');
const router = express.Router();
const { payment,confirmPayment,tmpConfirmPayment,tmpCreatePayment, tmpCreatePaymentCalc, tmpConfirmPaymentCalc} = require('../controllers/paymentController'); // Импорт контроллера

router.post('/payment', payment); 
// Маршрут для подтверждения платежа от WayForPay
router.post('/confirm-payment', confirmPayment)

router.post('/tmp-confirm-payment', tmpConfirmPayment);
router.post('/tmp-create-payment', tmpCreatePayment);

router.post('/tmp-create-payment-calc', tmpCreatePaymentCalc);
router.post('/tmp-confirm-payment-calc', tmpConfirmPaymentCalc);

module.exports = router;
