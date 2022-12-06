import mongoose from 'mongoose';

//создаем модель пользователя
const PostSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			require: true,
		},
		text: {
			type: String,
			require: true,
			unique: true,
		},
		tags: {
			type: Array,
			default: [],
		},
		viewsCount: {
			type: Number,
			default: 0,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		avatarUrl: String,
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Post', PostSchema);
