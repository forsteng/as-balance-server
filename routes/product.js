const express = require('express');
const router = express.Router();
const {getAllProducts, getProductById} = require('../controllers/productController');

router.post('/getData', getAllProducts);
router.get('/getProduct/:id', getProductById);

module.exports = router;