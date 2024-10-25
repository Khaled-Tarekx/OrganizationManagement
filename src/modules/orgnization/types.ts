import type { z } from 'zod';
import type { createOrgSchema, updateOrgSchema } from './validation';

export enum AccessLevel {
	member = 'member',
	admin = 'admin',
	owner = 'owner',
}
export type orgDTO = z.infer<typeof createOrgSchema>;
export type updateOrgDTO = z.infer<typeof updateOrgSchema>;
