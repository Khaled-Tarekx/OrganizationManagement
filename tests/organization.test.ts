import request from 'supertest';
import createApp from '../src/setup/createApp';
import { Application } from 'express';
import { User } from '../src/modules/auth/models';
import { faker } from '@faker-js/faker';
import { createTokenFromUser } from '../src/modules/auth/utilities';
import {
	Organization,
	OrganizationSchema,
} from '../src/modules/organization/models';
import { Document, InferRawDocType } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';

let app: Application;
let accessToken: string;
let organizationId: string;

// Helper function to create a user and return an access token
async function signUpAndSignInUser(
	name: string,
	email: string,
	password: string
): Promise<string> {
	const user = await User.create({ name, email, password });
	return createTokenFromUser(user, process.env.ACCESS_SECRET_KEY);
}

// Helper function to create an organization in the database
async function createOrganization(
	name: string,
	description: string
): Promise<DocumentType<OrganizationSchema>> {
	const organization = await Organization.create({ name, description });
	return organization;
}

beforeAll(async () => {
	app = createApp();

	// Create a user and obtain an access token
	const email = faker.internet.email();
	const password = faker.internet.password();
	const name = faker.person.fullName();

	try {
		accessToken = await signUpAndSignInUser(name, email, password);

		const organization = await createOrganization(
			'Test Organization',
			'An organization for testing'
		);
		organizationId = organization._id.toString();
	} catch (error) {
		console.error('Setup failed:', error);
	}
});

describe('Organization Endpoints', () => {
	it('should create a new organization', async () => {
		const res = await request(app)
			.post('/api/v1/organization')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'New Organization',
				description: 'A new test organization',
			});
		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty('organization_id');
		organizationId = res.body.organization_id; // Update for future tests
	});

	it('should retrieve the organization', async () => {
		const res = await request(app)
			.get(`/api/v1/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('organization_id', organizationId);
		expect(res.body).toHaveProperty('name', 'Test Organization');
		expect(res.body).toHaveProperty(
			'description',
			'An organization for testing'
		);
		expect(res.body).toHaveProperty('organization_members');
	});

	it('should update the organization', async () => {
		const res = await request(app)
			.put(`/api/v1/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'Updated Organization',
				description: 'Updated description',
			});
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('name', 'Updated Organization');
		expect(res.body).toHaveProperty('description', 'Updated description');
	});

	it('should retrieve the organization with the new member', async () => {
		const res = await request(app)
			.get(`/api/v1/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.organization_members.length).toBe(1); // Adjusted based on initial setup
	});

	it('should delete the organization', async () => {
		const res = await request(app)
			.delete(`/api/v1/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty(
			'message',
			'Organization deleted successfully'
		);
	});

	it('should invite a user to the organization', async () => {
		// Create an invited user
		const invitedEmail = faker.internet.email();
		await signUpAndSignInUser('Invited User', invitedEmail, 'password123');

		const res = await request(app)
			.post(`/api/v1/organization/${organizationId}/invite`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ user_email: invitedEmail });
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty(
			'message',
			'Invitation has been sent successfully'
		);
	});
});
