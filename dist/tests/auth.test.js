import request from 'supertest';
import createApp from '../src/setup/createApp.js';
import mongoose from 'mongoose';
import { User } from '../src/modules/auth/models.js';
import { faker } from '@faker-js/faker';
let app = createApp();
let refreshToken;
async function signupAndSigninUser(email, password) {
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
    await mongoose.connect(process.env.MONGO_URI);
    app = createApp();
});
beforeEach(async () => {
    await User.deleteMany({});
});
afterAll(async () => {
    await mongoose
        .disconnect()
        .catch((err) => console.error('Error disconnecting Mongo:', err));
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
    it('should return an error for signup with missing fields', async () => {
        const res = await request(app).post('/api/v1/signup').send({
            name: faker.person.firstName(),
        });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
    it('should return an error for signup with an invalid email format', async () => {
        const res = await request(app).post('/api/v1/signup').send({
            name: faker.person.firstName(),
            email: 'invalid-email-format',
            password: 'password123',
        });
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
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
    it('should return an error for signin with incorrect password', async () => {
        const email = 'testuser@example.com';
        const password = 'password123';
        const incorrectPassword = 'wrongpassword';
        await request(app).post('/api/v1/signup').send({
            name: faker.person.firstName(),
            email,
            password,
        });
        const res = await request(app)
            .post('/api/v1/signin')
            .send({ email, password: incorrectPassword });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
    it('should return an error for signin with non-existent email', async () => {
        const res = await request(app)
            .post('/api/v1/signin')
            .send({ email: 'nonexistent@example.com', password: 'password123' });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
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
    it('should return an error for refresh token with an invalid token', async () => {
        const invalidToken = 'invalidToken';
        const res = await request(app)
            .post('/api/v1/refresh-token')
            .send({ refresh_token: invalidToken });
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
    it('should return an error for refresh token with an expired token', async () => {
        // ...
    });
    // to be continued
});
