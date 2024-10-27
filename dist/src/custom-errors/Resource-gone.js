import { StatusCodes } from 'http-status-codes';
import CustomError from './custom-error.js';
class ResourceGone extends CustomError {
    constructor(message) {
        super(message, StatusCodes.GONE);
    }
}
export default ResourceGone;
