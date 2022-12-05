import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { registerValidation } from './validations/auth.js';

import UserModel from './models/User.js';

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

//запускаем сервер
app.listen(4444, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Server run is Ok');
});
