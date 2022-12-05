import express from 'express';

import mongoose from 'mongoose';
import { registerValidation } from './validations/auth.js';

import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';

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
app.post('/auth/register', registerValidation, UserController.register);

//Авторизация пользователя
app.post('/auth/login', UserController.login);

//Получаем информацию о себе
app.get('/auth/me', checkAuth, UserController.getMe);
//запускаем сервер
app.listen(4444, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Server run is Ok');
});
