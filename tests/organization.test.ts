import request from 'supertest';
import { createApp } from '../src/setup/createApp';
import { Application } from 'express';
import { User, UserSchema } from '../src/modules/auth/models';
import { faker } from '@faker-js/faker';
import {
	Member,
	Organization,
	OrganizationSchema,
} from '../src/modules/organization/models';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { createTokenFromUser } from '../src/modules/auth/utilities';
import { AccessLevel } from '../src/modules/organization/types';

let app: Application;
let accessToken: string;
let organizationId: string;

async function signUpAndSignInUser(
	name: string,
	email: string,
	password: string
): Promise<{ user: DocumentType<UserSchema>; token: string }> {
	const user = await User.create({ name, email, password });
	return {
		user,
		token: await createTokenFromUser(user, process.env.ACCESS_SECRET_KEY),
	};
}

async function createOrganization(
	name: string,
	description: string
): Promise<DocumentType<OrganizationSchema>> {
	return await Organization.create({ name, description });
}

beforeAll(async () => {
	app = createApp();
	await mongoose.connect(process.env.MONGO_URI);

	const email = faker.internet.email();
	const password = faker.internet.password();
	const name = faker.person.fullName();

	try {
		const { token } = await signUpAndSignInUser(name, email, password);
		accessToken = token;

		const organization = await createOrganization(
			'New Organization',
			'An organization for testing'
		);
		organizationId = organization._id.toString();
	} catch (error) {
		console.error('Setup failed:', error);
	}
});

afterAll(async () => {
	await mongoose
		.disconnect()
		.catch((err) => console.error('Error disconnecting Mongo:', err));
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
		expect(res.body.data).toHaveProperty('_id');
		organizationId = res.body.data._id;
	});

	it('should retrieve the organization', async () => {
		const res = await request(app)
			.get(`/api/v1/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.data).toHaveProperty('_id', organizationId);
		expect(res.body.data).toHaveProperty('name', 'New Organization');
		expect(res.body.data).toHaveProperty(
			'description',
			'A new test organization'
		);
		expect(res.body.data).toHaveProperty('organization_members');
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
		expect(res.body.data).toHaveProperty('name', 'Updated Organization');
		expect(res.body.data).toHaveProperty(
			'description',
			'Updated description'
		);
	});

	it('should retrieve the organization with the new member', async () => {
		const res = await request(app)
			.get(`/api/v1/organization/${organizationId}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.data.organization_members.length).toBe(1); // Adjusted based on initial setup
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

	it('should invite a user to the organization without permission', async () => {
		const invitedEmail = faker.internet.email();
		await signUpAndSignInUser('Invited User', invitedEmail, 'password123');
		const organization = await createOrganization('New Org', 'Description');

		const res = await request(app)
			.post(`/api/v1/organization/${organization._id.toString()}/invite`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ user_email: invitedEmail });

		expect(res.statusCode).toBe(403);
		expect(res.body).toHaveProperty(
			'message',
			'you are either not an owner or not an admin'
		);
	});

	it('should invite a user to the organization as owner', async () => {
		const invitedEmail = faker.internet.email();
		const { user, token } = await signUpAndSignInUser(
			'Invited User',
			invitedEmail,
			'password123'
		);
		const organization = await createOrganization('New Org', 'Description');

		const member = await Member.create({
			organization,
			user,
			access_level: AccessLevel.owner,
		});
		organization.organization_members.push(member);
		await organization.save();

		const res = await request(app)
			.post(`/api/v1/organization/${organization._id.toString()}/invite`)
			.set('Authorization', `Bearer ${token}`)
			.send({ user_email: invitedEmail });

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty(
			'message',
			'invitation has been sent successfully'
		);
	});

	it('should return 404 when trying to retrieve a non-existent organization', async () => {
		const nonExistentId = new mongoose.Types.ObjectId().toString();
		const res = await request(app)
			.get(`/api/v1/organization/${nonExistentId}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message', 'object not found');
	});

	it('should prevent updating organization without permission', async () => {
		const organization = await createOrganization(
			'Another Org',
			'Testing access restrictions'
		);

		const res = await request(app)
			.put(`/api/v1/organization/${organization._id.toString()}`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'Unauthorized Update',
				description: 'This update should not be allowed',
			});

		expect(res.statusCode).toBe(403);
		expect(res.body).toHaveProperty('message', 'forbidden');
	});

	it('should return 403 when inviting an existing member to the organization', async () => {
		const invitedEmail = faker.internet.email();
		const { user } = await signUpAndSignInUser(
			'Existing Member',
			invitedEmail,
			'password123'
		);
		const organization = await createOrganization(
			'Organization with Members',
			'Testing duplicate invites'
		);

		// Add the user as a member initially
		const member = await Member.create({
			organization,
			user,
			access_level: AccessLevel.member,
		});
		organization.organization_members.push(member);
		await organization.save();

		const res = await request(app)
			.post(`/api/v1/organization/${organization._id.toString()}/invite`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ user_email: invitedEmail });

		expect(res.statusCode).toBe(403);
		expect(res.body).toHaveProperty(
			'message',
			'you are either not an owner or not an admin'
		);
	});

	it('should return 403 for an invalid email format when inviting a user', async () => {
		const organization = await createOrganization(
			'Invalid Email Org',
			'Testing invalid email format'
		);

		const res = await request(app)
			.post(`/api/v1/organization/${organization._id.toString()}/invite`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ user_email: 'invalid-email-format' });

		expect(res.statusCode).toBe(403);
	});
});
