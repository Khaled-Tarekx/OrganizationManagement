import request from 'supertest';
import createApp from '../src/setup/createApp';
import mongoose from 'mongoose';
import { User } from '../src/modules/auth/models';
import { Application } from 'express';
import connectWithRetry from '../src/database/connection';

let refreshToken: string;
let app: Application;

describe('Refresh Token Endpoints', () => {
	beforeAll(async () => {
		await connectWithRetry;
		app = createApp();
		await mongoose.connect(process.env.MONGO_URI);

		await request(app).post('/signup').send({
			name: 'Token User',
			email: 'tokenuser@example.com',
			password: 'password123',
		});

		const res = await request(app).post('/signin').send({
			email: 'tokenuser@example.com',
			password: 'password123',
		});
		console.log(res.body);
		refreshToken = res.body.refresh_token;
		console.log(refreshToken);
	});

	afterAll(async () => {
		await User.deleteMany({});
		await mongoose.connection.close();
	});
	it('should signup in our app', async () => {
		const res = await request(app).post('/signup').send({
			name: 'Token User',
			email: 'tokenuser@example.com',
			password: 'password123',
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('messsage');
	});
	it('should signin in our app', async () => {
		const res = await request(app).post('/signin').send({
			email: 'tokenuser@example.com',
			password: 'password123',
		});
		expect(res.body).toHaveProperty('message');
		expect(res.body).toHaveProperty('access_token');
		expect(res.body).toHaveProperty('refresh_token');
		expect(res.statusCode).toEqual(200);
	});

	it('should refresh the access token', async () => {
		const res = await request(app).post('/refresh-token').send({
			refresh_token: refreshToken,
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('access_token');
		expect(res.body).toHaveProperty('refresh_token');
	});
});
