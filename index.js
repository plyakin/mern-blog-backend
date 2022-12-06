import express from 'express';

import mongoose from 'mongoose';
import {
	registerValidation,
	loginValidation,
	postCreateValidation,
} from './validations/validation.js';

import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';

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
app.post('/auth/login', loginValidation, UserController.login);

//Получаем информацию о себе
app.get('/auth/me', checkAuth, UserController.getMe);

//CRUD постов
app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', PostController.update);
//запускаем сервер
app.listen(4444, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Server run is Ok');
});
