const Course = require('../models/Course');

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find(); // Получаем все курсы из базы данных
        console.log(courses)
        res.json(courses); // Отправляем курсы в ответе
    } catch (error) {
        console.error('Ошибка при получении курсов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
exports.getCourseById = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        // Ищем курс в базе данных по его _id
        const course = await Course.findById(id);
        console.log(course);
        
        // Проверка, найден ли курс
        if (!course) {
            return res.status(404).json({ message: 'Курс не найден' });
        }

        // Возвращаем найденный курс
        res.json(course);
    } catch (error) {
        console.error("Ошибка при получении курса:", error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};