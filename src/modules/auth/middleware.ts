import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import {
	TokenVerificationFailed,
	UnAuthorized,
	UserNotFound,
} from './errors/cause';
import { User } from './models';
import { findResourceById } from '../../utills/helpers';
import { PayLoad } from './types';
const access_secret = process.env.ACCESS_SECRET_KEY;

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next(new UnAuthorized());
	}
	let decoded: PayLoad | string;
	const token = authHeader.split(' ')[1];
	try {
		decoded = jwt.verify(token, access_secret) as PayLoad;
	} catch (error: unknown) {
		return next(new TokenVerificationFailed());
	}

	const user = await findResourceById(User, decoded.userId, UserNotFound);
	req.user = {
		...user.toObject(),
		id: user._id.toString(),
	};

	next();
};
