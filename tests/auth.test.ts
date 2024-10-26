import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import { User } from '../src/modules/auth/models';

let refreshToken: string;

describe('Refresh Token Endpoints', () => {
	beforeAll(async () => {
		await mongoose.connect(process.env.MONGO_URI!);

		await request(app).post('/signup').send({
			name: 'Token User',
			email: 'tokenuser@example.com',
			password: 'password123',
		});

		const res = await request(app).post('/signin').send({
			email: 'tokenuser@example.com',
			password: 'password123',
		});

		refreshToken = res.body.refresh_token;
	});

	afterAll(async () => {
		await User.deleteMany({});
		await mongoose.connection.close();
	});

	it('should refresh the access token', async () => {
		const res = await request(app).post('/refresh-token').send({
			refresh_token: refreshToken,
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('access_token');
		expect(res.body).toHaveProperty('refresh_token', refreshToken);
	});
});
