import type { z } from 'zod';
import type {
	createUserSchema,
	loginSchema,
	refreshTokenSchema,
} from './validation';
import 'express';
import { InferRawDocType, Types } from 'mongoose';
import { UserSchema } from './models';

export enum Role {
	user = 'user',
	admin = 'admin',
}
export interface PayLoad {
	userId: string;
	user_id: string;
	exp: number;
}
export interface JsonTokenI {
	newRefreshToken: string;
	user_id: string;
}

export type refreshSessionDTO = z.infer<typeof refreshTokenSchema>;
export type createUserDTO = z.infer<typeof createUserSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
declare global {
	namespace Express {
		interface User extends InferRawDocType<UserSchema> {
			id: string;
			_id: string | Types.ObjectId;
		}
	}
}
