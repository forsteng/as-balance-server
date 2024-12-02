const express = require('express');
const router = express.Router();
const {getAllProducts, getSubscription,removeSubscription,getAllOrdersId,getAllOrders,getOrderById} = require('../controllers/orderController');

router.post('/products', getAllProducts);
router.post('/subscriptions', getSubscription);
router.post('/remove-subscriptions', removeSubscription);
router.get('/orderId', getAllOrdersId);
router.post('/orders', getAllOrders);
router.post('/orderById', getOrderById);

module.exports = router;