import z from 'zod';

export const env = z
	.object({
		SALT_ROUNDS: z.number().min(2),
		MONGO_URI: z.string(),
		PORT: z.string(),
		SALT_ROUNTS: z.string(),
		ACCESS_SECRET_KEY: z.string(),
		REFRESH_SECRET_KEY: z.string(),
		ACCESS_TOKEN_EXPIRATION: z.string(),
		REFRESH_TOKEN_EXPIRATION: z.string(),
		REFRESH_EXPIRATION_CASHE: z.string(),
		BASE_URL: z.string(),
		REDIS_HOST: z.string(),
		REDIS_PORT: z.string(),
		REDIS_PASSWORD: z.string(),
	})
	.parse(process.env);
