import type { z } from 'zod';
import type {
	createUserSchema,
	loginSchema,
	refreshTokenSchema,
} from './validation';

export enum Role {
	user = 'user',
	admin = 'admin',
}
export interface PayLoad {
	userId: string;
	user_id: string;
	exp: number;
}
export interface JsonToken {
	newRefreshToken: string;
	user_id: string;
}

export type refreshSessionDTO = z.infer<typeof refreshTokenSchema>;
export type createUserDTO = z.infer<typeof createUserSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
