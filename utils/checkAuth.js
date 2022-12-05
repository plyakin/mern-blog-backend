import jwt from 'jsonwebtoken';

export default (req, res, next) => {
	//получаем токен из заголовка запроса и убираем слово Bearer
	const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
	if (token) {
		try {
			const decoded = jwt.verify(token, 'secret123');
			req.userId = decoded._id;
			next();
		} catch (err) {
			return res.status(403).json({
				message: 'Нет доступа',
			});
		}
	} else {
		return res.status(403).json({
			message: 'Нет доступа',
		});
	}
};
