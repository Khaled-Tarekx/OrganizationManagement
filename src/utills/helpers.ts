import z from 'zod';
import { client } from '../..';
import { Types, Model, type HydratedDocument } from 'mongoose';
import {
	InvitationExpired,
	NotResourceOwner,
	NotValidId,
	TokenStoringFailed,
} from './errors/cause';
import {
	RefreshTokenError,
	UserNotFound,
} from '../modules/auth/errors/cause';

const DEFAULT_EXPIRATION = 7 * 24 * 60 * 60;
interface CachedToken {
	user_id: string | Types.ObjectId;
	newRefreshToken: string;
}
export const setTokenCache = async (
	key: string,
	value: CachedToken,
	expiration: number = Math.floor(Number(DEFAULT_EXPIRATION))
): Promise<void> => {
	try {
		await client.setEx(key, expiration, JSON.stringify(value));
	} catch (err: unknown) {
		throw new TokenStoringFailed();
	}
};

export const getOrSetCache = async <T>(
	key: string,
	value: CachedToken,
	expiration: number = Number(DEFAULT_EXPIRATION)
): Promise<CachedToken> => {
	try {
		const data = await client.get(key);
		if (data != null) {
			return JSON.parse(data);
		}

		await client.setEx(key, expiration, JSON.stringify(value));
		return value;
	} catch (err) {
		throw new RefreshTokenError();
	}
};

export const mongooseId = z.custom<string>(
	(v: string) => Types.ObjectId.isValid(v),
	{
		message: 'id is not valid mongoose id ',
	}
);

export const findResourceById = async <T>(
	model: Model<T>,
	id: string | Types.ObjectId,
	serviceError: new () => Error
): Promise<HydratedDocument<T>> => {
	const resource = await model.findById(id);

	if (!resource) {
		throw new serviceError();
	}
	return resource;
};

export function checkUser(
	user: Express.User | undefined
): asserts user is Express.User {
	if (!user) {
		throw new UserNotFound();
	}
}

export function checkResource<T>(
	resource: T | undefined | null,
	serviceError: new () => Error
): asserts resource is T {
	if (!resource) {
		throw new serviceError();
	}
}

export const validateObjectIds = (ids: string[]) => {
	const isValidIds = ids.every((id) => Types.ObjectId.isValid(id));

	if (!isValidIds) {
		throw new NotValidId();
	}
};

export const isResourceOwner = async (
	loggedInUserId: string,
	requesterId: string | Types.ObjectId
): Promise<Boolean> => {
	const userIsResourceOwner = loggedInUserId === requesterId.toString();
	if (!userIsResourceOwner) {
		throw new NotResourceOwner();
	}
	return true;
};

export const isExpired = (expiresAt: Date, createdAt: Date): Boolean => {
	if (expiresAt.getTime() <= createdAt.getTime()) {
		throw new InvitationExpired();
	}
	return true;
};
