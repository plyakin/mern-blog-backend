import { body } from 'express-validator';

//создаем валидацию для регистрации
export const registerValidation = [
	body('email', 'Неверный формат почты').isEmail(),
	body('password', 'Пароль минимум 5 символов').isLength({ min: 5 }),
	body('fullName', 'Укажите имя').isLength({ min: 3 }),
	body('avatarUrl', 'Неправильный формат ссылки на аватарку')
		.optional()
		.isURL(),
];
