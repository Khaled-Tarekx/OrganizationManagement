import request from 'supertest';
import createApp from '../src/setup/createApp';
import mongoose from 'mongoose';
import { User } from '../src/modules/auth/models';
import { Application } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';

let refreshToken: string;
let app = createApp();

beforeAll(async () => {
	const mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);

	await request(app).post('/api/v1/signup').send({
		name: 'Token User',
		email: 'tokenuser@example.com',
		password: 'password123',
	});

	const res = await request(app).post('/api/v1/signin').send({
		email: 'tokenuser@example.com',
		password: 'password123',
	});
	refreshToken = res.body.refresh_token;
	console.log(refreshToken);

	return async () => {
		await mongoose.connection.close();
	};
});

afterAll(async () => {
	await User.deleteMany({});
	await mongoose.connection.close();
});

describe('Auth Tests', () => {
	it('should signup in our app', async () => {
		const res = await request(app).post('/api/v1/signup').send({
			name: 'Token User',
			email: 'tokenuser@example.com',
			password: 'password123',
		});
		console.log(res.body);

		expect(res.body).toHaveProperty('message');

		expect(res.statusCode).toEqual(201);
	});
	it('should signin in our app', async () => {
		const res = await request(app).post('/api/v1/signin').send({
			email: 'tokenuser@example.com',
			password: 'password123',
		});
		console.log(res.body);

		expect(res.body).toHaveProperty('message');
		expect(res.body).toHaveProperty('access_token');
		expect(res.body).toHaveProperty('refresh_token');
		expect(res.statusCode).toEqual(200);
	});

	it('should refresh the access token', async () => {
		const res = await request(app).post('/api/v1/refresh-token').send({
			refresh_token: refreshToken,
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('access_token');
		expect(res.body).toHaveProperty('refresh_token');
	});
});
