import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error.js';
class NotFound extends CustomError {
    constructor(message = "object not found") {
        super(message, StatusCodes.NOT_FOUND);
    }
}
export default NotFound;
