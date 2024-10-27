import jwt from 'jsonwebtoken';
import { TokenVerificationFailed, UnAuthorized, UserNotFound, } from './errors/cause.js';
import { User } from './models.js';
import { findResourceById } from '../../utills/helpers.js';
const access_secret = process.env.ACCESS_SECRET_KEY;
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnAuthorized());
    }
    let decoded;
    const token = authHeader.split(' ')[1];
    try {
        decoded = jwt.verify(token, access_secret);
    }
    catch (error) {
        return next(new TokenVerificationFailed());
    }
    const user = await findResourceById(User, decoded.userId, UserNotFound);
    req.user = {
        ...user.toObject(),
        id: user._id.toString(),
    };
    next();
};
