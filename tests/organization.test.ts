import request from 'supertest';
import { app } from '../index';
import mongoose from 'mongoose';
import { User } from '../src/modules/auth/models';
import { Organization } from '../src/modules/organization/models';

let accessToken: string;
let organizationId: string;

describe('Organization Endpoints', () => {
	beforeAll(async () => {
		await mongoose.connect(process.env.MONGO_URI!);

		await request(app).post('/signup').send({
			name: 'Org Owner',
			email: 'owner@example.com',
			password: 'password123',
		});

		const res = await request(app).post('/signin').send({
			email: 'owner@example.com',
			password: 'password123',
		});

		accessToken = res.body.access_token;
	});

	afterAll(async () => {
		await User.deleteMany({});
		await Organization.deleteMany({});
		await mongoose.connection.close();
	});

	it('should create a new organization', async () => {
		const res = await request(app)
			.post('/organization')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'Test Organization',
				description: 'An organization for testing',
			});
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty('organization_id');
		organizationId = res.body.organization_id;
	});

	it('should retrieve the organization', async () => {
		const res = await request(app)
			.get(`/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('organization_id', organizationId);
		expect(res.body).toHaveProperty('name', 'Test Organization');
		expect(res.body).toHaveProperty(
			'description',
			'An organization for testing'
		);
		expect(res.body).toHaveProperty('organization_members');
		expect(res.body.organization_members.length).toBe(1);
	});

	it('should update the organization', async () => {
		const res = await request(app)
			.put(`/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'Updated Organization',
				description: 'Updated description',
			});
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('name', 'Updated Organization');
		expect(res.body).toHaveProperty('description', 'Updated description');
	});
	it('should retrieve the organization with the new member', async () => {
		const res = await request(app)
			.get(`/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body.organization_members.length).toBe(2);
	});

	it('should delete the organization', async () => {
		const res = await request(app)
			.delete(`/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty(
			'message',
			'Organization deleted successfully'
		);
	});
	it('should invite a user to the organization', async () => {
		await request(app).post('/signup').send({
			name: 'Invited User',
			email: 'invited@example.com',
			password: 'password123',
		});

		const res = await request(app)
			.post(`/organization/${organizationId}/invite`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				user_email: 'invited@example.com',
			});

		expect(res.statusCode).toEqual(200);

		expect(res.body).toHaveProperty(
			'message',
			`invitation has been sent successfully`
		);
	});
});
