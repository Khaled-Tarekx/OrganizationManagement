import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { User } from '../../src/modules/auth/models';

export interface TestUser {
	_id?: mongoose.Types.ObjectId;
	name: string;
	email: string;
	password: string;
	refreshToken?: string;
	accessToken?: string;
}

export const generateTestUser = (
	overrides: Partial<TestUser> = {}
): TestUser => ({
	name: faker.person.fullName(),
	email: faker.internet.email().toLowerCase(),
	password: faker.internet.password({ length: 10 }),
	...overrides,
});

export const createTestUser = async () => {
	const user = await User.create({
		email: 'khaled123@gmail.com',
		password: 'khaled123',
		name: 'khaledtarek',
	});

	return user;
};

// export const createAuthenticatedUser = async (
// 	request: any
// ): Promise<TestUser> => {
// 	const userData = await createTestUser();

// 	const response = await request.post('/api/v1/signin').send({
// 		email: userData.email,
// 		password: userData.password,
// 	});

// 	return {
// 		...userData,
// 		accessToken: response.body.access_token,
// 		refreshToken: response.body.refresh_token,
// 	};
// };

export const cleanupTestUser = async (userId: mongoose.Types.ObjectId) => {
	await User.findByIdAndDelete(userId);
};
