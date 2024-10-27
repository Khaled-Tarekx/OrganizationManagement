import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error';

class NotFound extends CustomError {
	constructor(message: string = "object not found") {
		super(message, StatusCodes.NOT_FOUND);
	}
}

export default NotFound;
