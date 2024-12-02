const express = require('express');
const router = express.Router();
const { register, 
    login,
    updateUserInfo,
    changePassword,
    checkUser,
    forgotPassword,
    resetPassword,
    sendEmails,
    unsubscribe} = require('../controllers/userController'); // Импорт контроллера

router.post('/register', register); 
router.post('/login', login); 
router.post('/updateUserInfo', updateUserInfo); 
router.post('/changePassword', changePassword); 
router.post('/check-user', checkUser);
router.post('/send-emails', sendEmails);
router.post('/unsubscribe', unsubscribe);

  // Обработчик для сброса пароля
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
