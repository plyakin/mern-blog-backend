import UserModel from '../models/User.js';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

//регистрация
export const register = async (req, res) => {
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
};
//авторизация
export const login = async (req, res) => {
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
};
//проверка авторизации
export const getMe = async (req, res) => {
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
};
