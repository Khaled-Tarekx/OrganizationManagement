import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error';

class AuthenticationError extends CustomError {
	constructor(message: string) {
		super(message, StatusCodes.UNAUTHORIZED);
	}
}

export default AuthenticationError;
