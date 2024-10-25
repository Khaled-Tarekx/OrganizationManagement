import {
	type createUserDTO,
	type loginDTO,
	refreshSessionDTO,
} from './types';
import User from './models';
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
import { client } from 'main';
import { JwtPayload } from './types';
import jwt from 'jsonwebtoken';

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
	const correctEmail = await User.findOne({ email });
	checkResource(correctEmail, LoginError);
	const correctPassword = await compare(password, correctEmail.password!);
	checkResource(correctPassword, LoginError);

	const [access_token, refresh_token] = await Promise.all([
		createTokenFromUser(
			correctEmail,
			process.env.ACCESS_SECRET_KEY,
			process.env.ACCESS_TOKEN_EXPIRATION
		),
		createTokenFromUser(
			correctEmail,
			process.env.REFRESH_SECRET_KEY,
			process.env.REFRESH_TOKEN_EXPIRATION
		),
	]);

	const refresh_key = generateUserCacheKey(correctEmail._id);
	await setTokenCache(refresh_key, {
		newRefreshToken: refresh_token,
		user_id: correctEmail.id,
	});

	const message = 'you have logged in successfully';
	return { message, access_token, refresh_token };
};

export const refreshSession = async (tokenInput: refreshSessionDTO) => {
	const { refreshToken } = tokenInput;
	const payload = jwt.verify(
		refreshToken,
		process.env.REFRESH_SECRET_KEY
	) as JwtPayload;

	const storedToken = await client.get(generateUserCacheKey(payload.userId));

	if (!storedToken || storedToken !== refreshToken) {
		throw new RefreshTokenError();
	}
	const user = await User.findById(payload.user_id);
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

	await setTokenCache(generateUserCacheKey(payload.userId), {
		newRefreshToken,
		user_id: payload.user_id,
	});

	return {
		message: 'Tokens refreshed successfully',
		access_token: newAccessToken,
		refresh_token: newRefreshToken,
	};
};
