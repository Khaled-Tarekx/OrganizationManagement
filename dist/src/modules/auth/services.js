import { User } from './models.js';
import { checkResource, setTokenCache } from '../../utills/helpers.js';
import { LoginError, RefreshTokenError, RegistrationError, UserNotFound, } from './errors/cause.js';
import { createTokenFromUser, generateUserCacheKey, hashPassword, } from './utilities.js';
import { verify } from 'argon2';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../setup/redisClient.js';
export const registerUser = async (userInput) => {
    const { name, email, password } = userInput;
    const hashedPassword = await hashPassword(password);
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
export const loginUser = async (logininput) => {
    const { email, password } = logininput;
    const user = await User.findOne({ email });
    checkResource(user, LoginError);
    const correctPassword = await verify(user.password, password);
    checkResource(correctPassword, LoginError);
    const [access_token, refresh_token] = await Promise.all([
        createTokenFromUser(user, process.env.ACCESS_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRATION),
        createTokenFromUser(user, process.env.REFRESH_SECRET_KEY, process.env.REFRESH_TOKEN_EXPIRATION),
    ]);
    const refresh_key = generateUserCacheKey(user._id);
    await setTokenCache(refresh_key, {
        newRefreshToken: refresh_token,
        user_id: user._id,
    });
    const message = 'you have logged in successfully';
    return { message, access_token, refresh_token };
};
export const refreshSession = async (tokenInput) => {
    const { refresh_token } = tokenInput;
    const payload = jwt.verify(refresh_token, process.env.REFRESH_SECRET_KEY);
    const storedToken = await redisClient.get(generateUserCacheKey(payload.userId));
    if (!storedToken) {
        throw new RefreshTokenError();
    }
    const jsonToken = JSON.parse(storedToken);
    if (!jsonToken.newRefreshToken ||
        jsonToken.newRefreshToken !== refresh_token) {
        throw new RefreshTokenError();
    }
    const user = await User.findById(payload.user_id);
    checkResource(user, UserNotFound);
    const [newAccessToken, newRefreshToken] = await Promise.all([
        createTokenFromUser(user, process.env.ACCESS_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRATION),
        createTokenFromUser(user, process.env.REFRESH_SECRET_KEY, process.env.REFRESH_TOKEN_EXPIRATION),
    ]);
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
