import mongoose from 'mongoose';

export const clearInMemoryDb = async () => {
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		await collections[key].deleteMany({});
	}
};
