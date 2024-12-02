const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;

const User = require('../models/User');

const senderEmail = process.env.EMAIL;
const key = process.env.SECRET_KEY;
const url = process.env.URL;
const mail_key = process.env.MAIL_KEY;

var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = mail_key;

exports.register = async (req, res) => {
    const { name, email, password, surname, isSubscribed } = req.body;
  
	try {
	  // Хэширование пароля
	  const hashedPassword = await bcrypt.hash(password, 10);
  
	  // Создание нового пользователя
	  const newUser = new User({
		name,
		email,
		password: hashedPassword,
		// Дополнительные поля можно оставить пустыми
		surname: surname ? surname : '',
		birthdate: '',
		phone: '',
		isSubscribed: !isSubscribed
	  });
  
	  // Генерация токена (например, JWT)
	  const token = await jwt.sign(
		{ userId: newUser._id, 
			email: newUser.email, 
			name: newUser.name, 
			surname: newUser.surname, 
			birthdate: newUser.birthdate, 
			phone: newUser.phone,
			role: newUser.role },
		require('crypto').randomBytes(64).toString('hex'), // Здесь необходимо заменить на ваш секретный ключ
		{ expiresIn: '1h' }
	  );
	  await newUser.save();
	  res.status(201).json({ message: 'Пользователь успешно зарегистрирован', token: token, name: newUser.name });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
	}
};

exports.login = async (req, res) => {
	const { email, password, isGoogleLogin } = req.body;
  
	try {
	  // Поиск пользователя по email
	  const user = await User.findOne({ email });
  
	  if (!user) {
		return res.status(400).json({ message: 'Пользователь не найден' });
	  }
  
	  if(!isGoogleLogin){
		// Проверка пароля
		const isPasswordValid = await bcrypt.compare(password, user.password);
		
		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Неправильный пароль' });
		}
	  }
  
	  // Генерация токена (например, JWT)
	  const token = await jwt.sign(
		{ userId: user._id, 
			email: user.email, 
			name: user.name, 
			surname: user.surname, 
			birthdate: user.birthdate, 
			phone: user.phone,
			role: user.role },
		require('crypto').randomBytes(64).toString('hex'), // Здесь необходимо заменить на ваш секретный ключ
		{ expiresIn: '1h' }
	  );
  
	  res.status(200).json({ message: 'Успешный вход', token: token, name: user.name });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Ошибка на сервере' });
	}
  };

  exports.updateUserInfo = async (req, res) => {
    const { userId, name, surname, birthdate, phone } = req.body;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userObjectId },  // Поиск по _id
            { name, surname, birthdate, phone },
            { new: true } // Возвращает обновленные данные
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.status(200).json({ message: 'Информация обновлена', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при обновлении информации' });
    }
};


exports.changePassword = async (req, res) => {
	const { userId, oldPassword, newPassword } = req.body;

    const userObjectId = new mongoose.Types.ObjectId(userId);
  
	try {
	  // Найдите пользователя по userId
	  const user = await User.findById(userObjectId);
	  
	  if (!user) {
		return res.status(404).json({ message: 'Пользователь не найден' });
	  }
  
	  // Проверьте старый пароль
	  const isMatch = await bcrypt.compare(oldPassword, user.password);
	  
	  if (!isMatch) {
		return res.status(400).json({ message: 'Неверный старый пароль' });
	  }
  
	  // Хешируйте новый пароль
	  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
	  // Обновите пароль пользователя
	  user.password = hashedPassword;
	  await user.save();
  
	  res.status(200).json({ message: 'Пароль успешно изменен' });
	} catch (error) {
	  console.error('Ошибка при изменении пароля:', error);
	  res.status(500).json({ message: 'Ошибка сервера' });
	}
  };

  exports.checkUser = async (req, res) => {
	const { email } = req.body;
    
    // Логика проверки пользователя в базе данных
    const user = await User.findOne({ email });
  
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  };
  
  exports.forgotPassword = async (req, res) => {
	const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден.' });
    }

    // Генерация токена для сброса пароля
    const token = await jwt.sign({ id: user._id }, key, { expiresIn: '1h' }); // Секретный ключ и время действия токена

	const resetUrl = `${url}/reset-password/${token}`;
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

	var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

	sendSmtpEmail = {
		sender: {
			email: senderEmail // Убедитесь, что senderEmail объявлена ранее
		  },
		to: [{
			email: email,
		}],
		subject: "Сброс пароля",
		htmlContent: `
		  <p>Вы получили это письмо, потому что вы (или кто-то другой) запросили сброс пароля для вашей учетной записи.</p>
		  <p>Пожалуйста, перейдите по следующей ссылке, чтобы сбросить пароль:</p>
		  <p><a href="${resetUrl}">${resetUrl}</a></p>
		  <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
		`
	};

	const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
	console.log('Ответ от сервера:', response);
    res.status(200).json({ message: 'Письмо с инструкциями по сбросу пароля отправлено на вашу почту.' });
  } catch (error) {
    console.error('Ошибка при отправке запроса на сброс пароля:', error);
    res.status(500).json({ message: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.' });
  }
  };
  
  exports.resetPassword = async (req, res) => {
	const { token, newPassword } = req.body;
	try {
	  // Проверка токена
	  const decoded = jwt.verify(token, key); // Используем секретный ключ для верификации токена
	  const userObjectId = new mongoose.Types.ObjectId(decoded.id);
	  const user = await User.findById(userObjectId); // Получаем пользователя по ID из токена
  
	  if (!user) {
		return res.status(400).json({ message: 'Пользователь не найден.' });
	  }

	  const hashedPassword = await bcrypt.hash(newPassword, 10);
	  user.password = hashedPassword; // Здесь необходимо захешировать пароль
	  await user.save();
  
	  res.status(200).json({ message: 'Пароль успешно сброшен.' });
	} catch (error) {
	  console.error('Ошибка при сбросе пароля:', error);
	  res.status(500).json({ message: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.' });
	}
  };
  
  exports.sendEmails = async (req, res) => {
	try {
		const { subject, message } = req.body;
	
		// Получаем первых 300 пользователей, которые подписаны и имеют роль 'user'
		const users = await User.find({ isSubscribed: true, role: 'user' }).limit(300);
		// Если пользователей нет
		if (!users.length) {
			return res.status(404).json({ success: false, message: 'Нет подписанных пользователей' });
		}
		var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
		var emailContent = new SibApiV3Sdk.SendSmtpEmail(); 

	
		// Итерация по каждому подписанному пользователю с ролью 'user'
		for (const user of users) {
			const token = await jwt.sign({ email: user.email }, key, { expiresIn: '1h' }); // Секретный ключ и время действия токена
			const unsubscribeLink = `${url}/unsubscribe/${token}`; // Ссылка для отписки
	
			emailContent = {
				sender: {
					email: senderEmail, // Укажите правильный email отправителя
				},
				to: [{
					email: user.email,
				}],
				subject: subject,
				htmlContent: `
					<p>${message}</p>
					<p>Если вы больше не хотите получать наши письма, <a href="${unsubscribeLink}">отпишитесь здесь</a>.</p>
				`,
			};
	  
			// Отправляем сообщение через Sendinblue
			await apiInstance.sendTransacEmail(emailContent);
		}
	
		// Возвращаем успешный ответ
		return res.status(200).json({ success: true, message: 'Сообщения отправлены подписанным пользователям' });
	
	} catch (error) {
		console.error('Ошибка при отправке писем:', error);
		return res.status(500).json({ success: false, message: 'Ошибка при отправке писем' });
	}
};

exports.unsubscribe = async (req, res) => {
	try {
		const { token } = req.body;
		const decoded = jwt.verify(token, key); // Используем секретный ключ для верификации токена

		// Проверяем, существует ли пользователь с указанным email
		const user = await User.findOne({ email: decoded.email });
		if (!user) {
			return res.status(404).json({ success: false, message: 'Пользователь не найден' });
		}

		// Обновляем статус подписки на false
		user.isSubscribed = false;
		await user.save();

		return res.status(200).json({ success: true, message: 'Вы успешно отписались от рассылки' });
	} catch (error) {
		console.error('Ошибка при отписке:', error);
		return res.status(500).json({ success: false, message: 'Ошибка при обработке запроса на отписку' });
	}
};

  