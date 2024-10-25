import { UserSchema } from './models';
import jwt from 'jsonwebtoken';

import { hash } from 'bcrypt';
import { DocumentType } from '@typegoose/typegoose';
import { PasswordHashingError, TokenGenerationFailed } from './errors/cause';
import { Types } from 'mongoose';

export const createTokenFromUser = async (
	user: DocumentType<UserSchema>,
	secret: string,
	expires?: string
) => {
	let token;
	try {
		token = jwt.sign({ id: user._id || user, role: user.role }, secret, {
			expiresIn: expires,
		});
	} catch (err) {
		throw new TokenGenerationFailed();
	}
	return token;
};

export const generateUserCacheKey = (
	userId: string | Types.ObjectId
): string => {
	return `user:${userId.toString()}:refresh_token`;
};

export const hashPassword = async (
	normalPassword: string,
	saltRounds: string | undefined
): Promise<string> => {
	if (!normalPassword) {
		throw new PasswordHashingError(
			'the hashing process of the password failed'
		);
	}
	return hash(normalPassword, Number(saltRounds));
};
