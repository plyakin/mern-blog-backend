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

export const loginValidation = [
	body('email', 'Неверный формат почты').isEmail(),
	body('password', 'Пароль минимум 5 символов').isLength({ min: 5 }),
];

export const postCreateValidation = [
	body('title', 'Введите заголовок статьи').isLength({ min: 3 }).isString(),
	body('text', 'Введите текчт статьи').isLength({ min: 10 }).isString(),
	body('tags', 'Неверный формат тегов (укажите массив)')
		.optional()
		.isString(),
	body('imageUrl', 'Неправильный формат ссылки на изображение')
		.optional()
		.isString(),
];
