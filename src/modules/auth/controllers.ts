import type { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
	createUserSchema,
	loginSchema,
	refreshTokenSchema,
} from './validation';
import type { TypedRequestBody } from 'zod-express-middleware';
import * as AuthServices from './services';
import {
	LoginError,
	PasswordHashingError,
	RefreshTokenError,
	RegistrationError,
	TokenGenerationFailed,
	UserNotFound,
} from './errors/cause';
import {
	AuthenticationError,
	Forbidden,
	NotFound,
} from '../../custom-errors/main';
import * as ErrorMsg from './errors/msg';
import { TokenStoringFailed } from '../../utills/errors/cause';
import jwt from 'jsonwebtoken';

export const registerUser = async (
	req: TypedRequestBody<typeof createUserSchema>,
	res: Response,
	next: NextFunction
) => {
	const { name, email, password } = req.body;
	try {
		const message = await AuthServices.registerUser({
			name,
			email,
			password,
		});
		res.status(StatusCodes.CREATED).json({ message });
	} catch (err: unknown) {
		if (
			err instanceof PasswordHashingError ||
			err instanceof RegistrationError
		) {
			return next(new AuthenticationError(ErrorMsg.UserRegistraionFailed));
		}
		return next(err);
	}
};

export const signInUser = async (
	req: TypedRequestBody<typeof loginSchema>,
	res: Response,
	next: NextFunction
) => {
	const { email, password } = req.body;
	try {
		const { message, access_token, refresh_token } =
			await AuthServices.loginUser({ email, password });

		res.status(StatusCodes.OK).json({ message, access_token, refresh_token });
	} catch (err: unknown) {
		if (err instanceof LoginError) {
			return next(new AuthenticationError(err.message));
		}
		if (
			err instanceof TokenGenerationFailed ||
			err instanceof TokenStoringFailed
		) {
			return next(new NotFound(ErrorMsg.LoginError));
		}
		return next(err);
	}
};

export const refreshSession = async (
	req: TypedRequestBody<typeof refreshTokenSchema>,
	res: Response,
	next: NextFunction
) => {
	const { refresh_token } = req.body;
	try {
		const { message, accessToken, refreshToken } =
			await AuthServices.refreshSession({ refresh_token });

		res.status(StatusCodes.OK).json({ message, accessToken, refreshToken });
	} catch (err: unknown) {
		if (
			err instanceof RefreshTokenError ||
			err instanceof UserNotFound ||
			err instanceof TokenGenerationFailed ||
			err instanceof TokenStoringFailed ||
			err instanceof jwt.JsonWebTokenError
		) {
			return next(new AuthenticationError(ErrorMsg.SessionExpired));
		}

		return next(new Forbidden());
	}
};
