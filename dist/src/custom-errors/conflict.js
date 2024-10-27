import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error.js';
class Conflict extends CustomError {
    constructor(message) {
        super(message, StatusCodes.CONFLICT);
    }
}
export default Conflict;
