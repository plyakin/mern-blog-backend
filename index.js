import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { registerValidation } from './validations/auth.js';

import UserModel from './models/User.js';
import checkAuth from './utils/checkAuth.js';

mongoose
	.connect(
		'mongodb+srv://admin:Lemon2927@cluster0.maxpv9a.mongodb.net/blog?retryWrites=true&w=majority'
	)
	.then(() => {
		console.log('DB ok');
	})
	.catch((err) => {
		console.log('DB error', err);
	});

const app = express();
app.use(express.json());

//Регистрация пользователя
app.post('/auth/register', registerValidation, async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors.array());
		}

		//создаем  хеш переданного на бек пароля
		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		//заполняем модель пользователя
		const doc = new UserModel({
			email: req.body.email,
			fullName: req.body.fullName,
			avatarUrl: req.body.avatarUrl,
			passwordHash: hash,
		});

		//создаем пользователя и сохраняем в базу
		const user = await doc.save();

		//создаем токен из обьекта user -> вернулся строкой выше
		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secret123',
			{ expiresIn: '30d' }
		);
		//ответ пользователю после регистрации
		//не передаем хеш
		const { passwordHash, ...userData } = user._doc;
		res.json({
			...userData,
			token,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'Не удалось зарегистрироваться',
		});
	}
});

//Авторизация пользователя
app.post('/auth/login', async (req, res) => {
	try {
		// Ищем пользователя в бд по емайлу
		const user = await UserModel.findOne({ email: req.body.email });
		if (!user) {
			//желательно не указывать почему пользователь не авторизовался
			return res.status(404).json({
				message: 'Пользователь не найден',
			});
		}
		//проверяем сходяться ли переданный пароль и пароль у найденного пользователя
		const isValidPassword = await bcrypt.compare(
			req.body.password,
			user._doc.passwordHash
		);
		// Возвращаемая уточненная ошибка для нас
		if (!isValidPassword) {
			return res.status(404).json({
				message: 'Пароль не верен',
			});
		}
		//создаем токен из данных
		const token = jwt.sign(
			{
				_id: user._id,
			},
			'secret123',
			{ expiresIn: '30d' }
		);
		const { passwordHash, ...userData } = user._doc;
		//ответ пользователю
		res.json({
			...userData,
			token,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'Авторизация не удалась',
		});
	}
});

//Получаем информацию о себе
app.get('/auth/me', checkAuth, async (req, res) => {
	try {
		//прошлт проверку мидлвара и ищем пользователя по расшифрованному id
		const user = await UserModel.findById(req.userId);
		//если такого пользователя нет
		if (!user) {
			return res.status(404).json({
				message: 'Пользователь не найден',
			});
		}
		//если пользователь найден
		const { passwordHash, ...userData } = user._doc;
		res.json({
			...userData,
		});
	} catch (err) {
		res.status(500).json({
			message: 'Нет доступа',
		});
	}
});
//запускаем сервер
app.listen(4444, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Server run is Ok');
});
