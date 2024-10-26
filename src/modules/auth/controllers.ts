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
import { AuthenticationError, NotFound } from '../../custom-errors/main';
import * as ErrorMsg from './errors/msg';
import { TokenStoringFailed } from '../../utills/errors/cause';

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
		switch (true) {
			case err instanceof PasswordHashingError:
				return next(new AuthenticationError(ErrorMsg.UserRegistraionFailed));
			case err instanceof RegistrationError:
				return next(new AuthenticationError(ErrorMsg.UserRegistraionFailed));
			default:
				return next(err);
		}
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
			return next(new AuthenticationError(ErrorMsg.LoginError));
		}

		if (err instanceof TokenGenerationFailed) {
		}
		switch (true) {
			case err instanceof LoginError:
				return next(new AuthenticationError(ErrorMsg.LoginError));
			case err instanceof TokenGenerationFailed:
				return next(new NotFound(ErrorMsg.LoginError));
			case err instanceof TokenStoringFailed:
				return next(new NotFound(ErrorMsg.LoginError));
			default:
				return next(err);
		}
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
		switch (true) {
			case err instanceof RefreshTokenError:
				return next(new AuthenticationError(ErrorMsg.SessionExpired));
			case err instanceof UserNotFound:
				return next(new AuthenticationError(ErrorMsg.SessionExpired));
			case err instanceof TokenGenerationFailed:
				return next(new AuthenticationError(ErrorMsg.SessionExpired));
			case err instanceof TokenStoringFailed:
				return next(new AuthenticationError(ErrorMsg.SessionExpired));
			default:
				return next(err);
		}
	}
};
