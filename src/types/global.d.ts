import 'dotenv/config';
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			URI: string;
			PORT: string;
			SALT_ROUNTS: string;
			ACCESS_SECRET_KEY: string;
			REFRESH_SECRET_KEY: string;
			ACCESS_TOKEN_EXPIRATION: string;
			REFRESH_TOKEN_EXPIRATION: string;
			BASE_URL: string;
			REFRESH_EXPIRATION_CASHE: string;
			NODE_ENV: string;
		}
	}
}
