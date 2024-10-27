// import request from 'supertest';
// import createApp from '../src/setup/createApp';
// import mongoose from 'mongoose';
// import { User } from '../src/modules/auth/models';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// let refreshToken: string;
// let app = createApp();

// import { faker } from '@faker-js/faker';
// import { createTestUser } from './utils/helpers';

// let mongoServer: MongoMemoryServer;

// beforeAll(async () => {
// 	mongoServer = await MongoMemoryServer.create();
// 	const uri = mongoServer.getUri();
// 	await mongoose.connect(uri);
// 	app = createApp();
// });

// // beforeEach(async () => {
// // 	await User.deleteMany({});
// // });

// afterAll(async () => {
// 	await mongoose.disconnect();
// 	await mongoServer.stop();
// });

// describe('Auth Tests', () => {
// 	it('should successfully signup a new user', async () => {
// 		const res = await request(app).post('/api/v1/signup').send({
// 			name: 'Token User',
// 			email: faker.internet.email(),
// 			password: 'password123',
// 		});
// 		expect(res.statusCode).toBe(201);
// 		expect(res.body).toHaveProperty('message');
// 	});
// 	it('should prevent duplicate signup', async () => {
// 		const email = faker.internet.email();
// 		await request(app).post('/api/v1/signup').send({
// 			name: 'Token User',
// 			email: email,
// 			password: 'password123',
// 		});
// 		const res = await request(app).post('/api/v1/signup').send({
// 			name: 'Token User',
// 			email: email,
// 			password: 'password123',
// 		});

// 		expect(res.statusCode).toBe(400);
// 	});
// 	it('should successfully signin', async () => {
// 		const signUpres = await request(app).post('/api/v1/signup').send({
// 			name: 'Token User',
// 			email: ' khaled@gmail.com',
// 			password: 'password123',
// 		});
// 		console.log('Signin response:', signUpres.body);

// 		const res = await request(app).post('/api/v1/signin').send({
// 			email: 'khaled@gmail.com',
// 			password: 'password123',
// 		});
// 		console.log('Signin response:', res.body);

// 		expect(res.statusCode).toBe(200);
// 		expect(res.body).toHaveProperty('message');

// 		expect(res.body).toHaveProperty('access_token');
// 		expect(res.body).toHaveProperty('refresh_token');
// 	});

// 	it('should refresh access token', async () => {
// 		const signinRes = await request(app).post('/api/v1/signin').send({
// 			email: 'tokenuser@example.com',
// 			password: 'password123',
// 		});
// 		refreshToken = signinRes.body.refresh_token;
// 		const res = await request(app)
// 			.post('/api/v1/refresh-token')
// 			.send({ refresh_token: refreshToken });

// 		expect(res.statusCode).toBe(200);
// 		expect(res.body).toHaveProperty('message');

// 		expect(res.body).toHaveProperty('accessToken');
// 		expect(res.body).toHaveProperty('refreshToken');
// 	});
// });
import request from 'supertest';
import createApp from '../src/setup/createApp';
import mongoose from 'mongoose';
import { User } from '../src/modules/auth/models';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { faker } from '@faker-js/faker';
import { createTestUser } from './utils/helpers';

let app = createApp();
let mongoServer: MongoMemoryServer;
let refreshToken: string;

// Utility function to sign up and sign in a user
async function signupAndSigninUser(email: string, password: string) {
	await request(app).post('/api/v1/signup').send({
		name: faker.person.firstName(),
		email,
		password,
	});
	const signinRes = await request(app)
		.post('/api/v1/signin')
		.send({ email, password });
	return signinRes;
}

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);
	app = createApp();
});

beforeEach(async () => {
	await User.deleteMany({});
});

afterAll(async () => {
	await mongoose
		.disconnect()
		.catch((err) => console.error('Error disconnecting Mongo:', err));
	await mongoServer
		.stop()
		.catch((err) => console.error('Error stopping MongoMemoryServer:', err));
});

describe('Auth Tests', () => {
	it('should successfully signup a new user', async () => {
		const email = faker.internet.email();
		const res = await request(app).post('/api/v1/signup').send({
			name: faker.person.firstName(),
			email,
			password: 'password123',
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty('message');
	});

	it('should prevent duplicate signup', async () => {
		const email = faker.internet.email();
		const password = 'password123';

		await request(app)
			.post('/api/v1/signup')
			.send({ name: 'Token User', email, password });
		const res = await request(app)
			.post('/api/v1/signup')
			.send({ name: 'Token User', email, password });

		expect(res.statusCode).toBe(400);
	});

	it('should successfully signin', async () => {
		const email = 'khaled@gmail.com';
		const password = 'password123';

		await request(app).post('/api/v1/signup').send({
			name: faker.person.firstName(),
			email,
			password,
		});

		const res = await request(app)
			.post('/api/v1/signin')
			.send({ email, password });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body).toHaveProperty('access_token');
		expect(res.body).toHaveProperty('refresh_token');
	});

	it('should refresh access token', async () => {
		const email = 'tokenuser@example.com';
		const password = 'password123';

		const signinRes = await signupAndSigninUser(email, password);
		refreshToken = signinRes.body.refresh_token;

		const res = await request(app)
			.post('/api/v1/refresh-token')
			.send({ refresh_token: refreshToken });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body).toHaveProperty('accessToken');
		expect(res.body).toHaveProperty('refreshToken');
	});
});
