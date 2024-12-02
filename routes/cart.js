const express = require('express');
const router = express.Router();
const {addToCart,getCart,updateCart,deleteItem} = require('../controllers/cartController');

router.get('/getCart/:id', getCart);
router.post('/addToCart', addToCart);
router.post('/updateCart', updateCart);
router.post('/deleteItem', deleteItem);

module.exports = router;