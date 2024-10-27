import { UserSchema } from './models';
import jwt from 'jsonwebtoken';

import { hash } from 'argon2';
import { DocumentType } from '@typegoose/typegoose';
import { PasswordHashingError, TokenGenerationFailed } from './errors/cause';
import { Types } from 'mongoose';

export const createTokenFromUser = async (
	user: DocumentType<UserSchema>,
	secret: string,
	expires: string = "1h"
) => {
	let token;
	try {
		token = jwt.sign(
			{ user_id: user._id, userId: user.id, role: user.role },
			secret,
			{
				expiresIn: expires,
			}
		);
	} catch (err) {
		console.error(err);
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
): Promise<string> => {
	if (!normalPassword) {
		throw new PasswordHashingError(
			'the hashing process of the password failed'
		);
	}
	
	return hash(normalPassword);
};
