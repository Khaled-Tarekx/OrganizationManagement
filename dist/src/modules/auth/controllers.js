import { StatusCodes } from 'http-status-codes';
import * as AuthServices from './services.js';
import { LoginError, PasswordHashingError, RefreshTokenError, RegistrationError, TokenGenerationFailed, UserNotFound, } from './errors/cause.js';
import { AuthenticationError, Forbidden, NotFound, } from '../../custom-errors/main.js';
import * as ErrorMsg from './errors/msg.js';
import { TokenStoringFailed } from '../../utills/errors/cause.js';
import jwt from 'jsonwebtoken';
export const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        const message = await AuthServices.registerUser({
            name,
            email,
            password,
        });
        res.status(StatusCodes.CREATED).json({ message });
    }
    catch (err) {
        if (err instanceof PasswordHashingError ||
            err instanceof RegistrationError) {
            return next(new AuthenticationError(ErrorMsg.UserRegistraionFailed));
        }
        return next(err);
    }
};
export const signInUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const { message, access_token, refresh_token } = await AuthServices.loginUser({ email, password });
        res.status(StatusCodes.OK).json({ message, access_token, refresh_token });
    }
    catch (err) {
        if (err instanceof LoginError) {
            return next(new AuthenticationError(err.message));
        }
        if (err instanceof TokenGenerationFailed ||
            err instanceof TokenStoringFailed) {
            return next(new NotFound(ErrorMsg.LoginError));
        }
        return next(err);
    }
};
export const refreshSession = async (req, res, next) => {
    const { refresh_token } = req.body;
    try {
        const { message, accessToken, refreshToken } = await AuthServices.refreshSession({ refresh_token });
        res.status(StatusCodes.OK).json({ message, accessToken, refreshToken });
    }
    catch (err) {
        if (err instanceof RefreshTokenError ||
            err instanceof UserNotFound ||
            err instanceof TokenGenerationFailed ||
            err instanceof TokenStoringFailed ||
            err instanceof jwt.JsonWebTokenError) {
            return next(new AuthenticationError(ErrorMsg.SessionExpired));
        }
        return next(new Forbidden());
    }
};
