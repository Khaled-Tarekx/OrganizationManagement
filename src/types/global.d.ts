import { InferRawDocType, Types } from 'mongoose';
import { UserSchema } from './models';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MONGO_URI: string;
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
	namespace Express {
		interface User extends InferRawDocType<UserSchema> {
			id: string;
			_id: string | Types.ObjectId;
		}
		interface Request {
			user?: User;
		}
	}
}
