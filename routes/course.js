const express = require('express');
const router = express.Router();
const {getAllCourses,getCourseById} = require('../controllers/courseController');

router.get('/getData', getAllCourses);
// Маршрут для получения курса по id
router.get('/getCourseById/:id', getCourseById);
module.exports = router;