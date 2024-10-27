import jwt from 'jsonwebtoken';
import { hash } from 'argon2';
import { PasswordHashingError, TokenGenerationFailed } from './errors/cause';
export const createTokenFromUser = async (user, secret, expires = "1h") => {
    let token;
    try {
        token = jwt.sign({ user_id: user._id, userId: user.id, role: user.role }, secret, {
            expiresIn: expires,
        });
    }
    catch (err) {
        console.error(err);
        throw new TokenGenerationFailed();
    }
    return token;
};
export const generateUserCacheKey = (userId) => {
    return `user:${userId.toString()}:refresh_token`;
};
export const hashPassword = async (normalPassword) => {
    if (!normalPassword) {
        throw new PasswordHashingError('the hashing process of the password failed');
    }
    return hash(normalPassword);
};
