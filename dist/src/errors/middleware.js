import { handleDBErrors, isDBError, sendErrorForDev, sendErrorForProd, } from './helpers';
const ErrorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    const environment = process.env.NODE_ENV || 'production';
    const isDbError = isDBError(error);
    const processedError = isDbError ? handleDBErrors(error) : error;
    if (environment === 'prod') {
        return sendErrorForProd(processedError, res);
    }
    return sendErrorForDev(processedError, res);
};
export default ErrorHandler;
