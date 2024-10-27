import z from 'zod';
import { Types } from 'mongoose';
import { InvitationExpired, NotResourceOwner, NotValidId, TokenStoringFailed, } from './errors/cause.js';
import { RefreshTokenError, UserNotFound, } from '../modules/auth/errors/cause.js';
import { redisClient } from '../setup/redisClient.js';
const DEFAULT_EXPIRATION = 7 * 24 * 60 * 60;
export const setTokenCache = async (key, value, expiration = Math.floor(Number(DEFAULT_EXPIRATION))) => {
    try {
        await redisClient.setEx(key, expiration, JSON.stringify(value));
    }
    catch (err) {
        console.error(err);
        throw new TokenStoringFailed();
    }
};
export const getOrSetCache = async (key, value, expiration = Number(DEFAULT_EXPIRATION)) => {
    try {
        const data = await redisClient.get(key);
        if (data != null) {
            return JSON.parse(data);
        }
        await redisClient.setEx(key, expiration, JSON.stringify(value));
        return value;
    }
    catch (err) {
        throw new RefreshTokenError();
    }
};
export const mongooseId = z.custom((v) => Types.ObjectId.isValid(v), {
    message: 'id is not valid mongoose id ',
});
export const findResourceById = async (model, id, serviceError) => {
    const resource = await model.findById(id);
    if (!resource) {
        throw new serviceError();
    }
    return resource;
};
export function checkUser(user) {
    if (!user) {
        throw new UserNotFound();
    }
}
export function checkResource(resource, serviceError) {
    if (!resource) {
        throw new serviceError();
    }
}
export const validateObjectIds = (ids) => {
    const isValidIds = ids.every((id) => Types.ObjectId.isValid(id));
    if (!isValidIds) {
        throw new NotValidId();
    }
};
export const isResourceOwner = async (loggedInUserId, requesterId) => {
    const userIsResourceOwner = loggedInUserId === requesterId.toString();
    if (!userIsResourceOwner) {
        throw new NotResourceOwner();
    }
    return true;
};
export const isExpired = (expiresAt, createdAt) => {
    if (expiresAt.getTime() <= createdAt.getTime()) {
        throw new InvitationExpired();
    }
    return true;
};
