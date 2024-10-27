import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error';
class BadRequestError extends CustomError {
    constructor(message) {
        super(message, StatusCodes.BAD_REQUEST);
    }
}
export default BadRequestError;
