import express from 'express';
import { refreshSession, registerUser, signInUser } from './controllers';
import { validateResource } from '../../utills/middlewares';
import { loginSchema, createUserSchema, refreshTokenSchema, } from './validation';
const router = express.Router();
router.post('/signup', validateResource({ bodySchema: createUserSchema }), registerUser);
router.post('/signin', validateResource({ bodySchema: loginSchema }), signInUser);
router.post('/refresh-token', validateResource({ bodySchema: refreshTokenSchema }), refreshSession);
export default router;
