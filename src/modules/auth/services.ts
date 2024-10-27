import {
	type createUserDTO,
	JsonToken,
	type loginDTO,
	PayLoad,
	refreshSessionDTO,
} from './types';
import { User } from './models';
import { checkResource, setTokenCache } from '../../utills/helpers';
import {
	LoginError,
	RefreshTokenError,
	RegistrationError,
	UserNotFound,
} from './errors/cause';
import {
	createTokenFromUser,
	generateUserCacheKey,
	hashPassword,
} from './utilities';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../setup/redisClient';

export const registerUser = async (userInput: createUserDTO) => {
	const { name, email, password } = userInput;
	const hashedPassword = await hashPassword(
		password,
		process.env.SALT_ROUNTS
	);
	const user = await User.create({
		name,
		email,
		password: hashedPassword,
	});
	if (!user) {
		throw new RegistrationError();
	}

	return 'your account has been successfully registered in our app';
};

export const loginUser = async (logininput: loginDTO) => {
	const { email, password } = logininput;
	const user = await User.findOne({ email });
	checkResource(user, LoginError);
	const correctPassword = await compare(password, user.password!);
	checkResource(correctPassword, LoginError);

	const [access_token, refresh_token] = await Promise.all([
		createTokenFromUser(
			user,
			process.env.ACCESS_SECRET_KEY,
			process.env.ACCESS_TOKEN_EXPIRATION
		),
		createTokenFromUser(
			user,
			process.env.REFRESH_SECRET_KEY,
			process.env.REFRESH_TOKEN_EXPIRATION
		),
	]);

	const refresh_key = generateUserCacheKey(user._id);
	await setTokenCache(refresh_key, {
		newRefreshToken: refresh_token,
		user_id: user._id,
	});
	const message = 'you have logged in successfully';
	return { message, access_token, refresh_token };
};

export const refreshSession = async (tokenInput: refreshSessionDTO) => {
	const { refresh_token } = tokenInput;
	const payload = jwt.verify(
		refresh_token,
		process.env.REFRESH_SECRET_KEY
	) as PayLoad;
	console.error(1);

	const storedToken = await redisClient.get(
		generateUserCacheKey(payload.userId)
	);
	if (!storedToken) {
		console.error(2);
		throw new RefreshTokenError();
	}

	const jsonToken: JsonToken = JSON.parse(storedToken);

	if (
		!jsonToken.newRefreshToken ||
		jsonToken.newRefreshToken !== refresh_token
	) {
		console.error(3);

		throw new RefreshTokenError();
	}

	const user = await User.findById(payload.user_id);
	console.error(4);

	checkResource(user, UserNotFound);
	const [newAccessToken, newRefreshToken] = await Promise.all([
		createTokenFromUser(
			user,
			process.env.ACCESS_SECRET_KEY,
			process.env.ACCESS_TOKEN_EXPIRATION
		),
		createTokenFromUser(
			user,
			process.env.REFRESH_SECRET_KEY,
			process.env.REFRESH_TOKEN_EXPIRATION
		),
	]);
	console.error(5);

	await setTokenCache(generateUserCacheKey(payload.userId), {
		newRefreshToken,
		user_id: payload.user_id,
	});

	return {
		message: 'Tokens refreshed successfully',
		accessToken: newAccessToken,
		refreshToken: newRefreshToken,
	};
};
