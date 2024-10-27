import mongoose from 'mongoose';

export default async () => {
	console.log(`connecting to ${process.env.MONGO_URI}`);
	await mongoose.connect(process.env.MONGO_URI);
};
