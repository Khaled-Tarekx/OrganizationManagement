import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import connectWithRetry from '../../src/database/connection';

jest.mock('redis', () => jest.requireActual('redis-mock'));

jest.mock('../../src/database/connection.ts', async () => {
	const connectWithRetry = async () => {
		const mongoServer = new MongoMemoryServer();
		const uri = mongoServer.getUri();

		await mongoose.connect(uri);
	};

	return connectWithRetry;
});

connectWithRetry;
