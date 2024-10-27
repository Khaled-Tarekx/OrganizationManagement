import type { NextFunction, Request, Response } from 'express';
import { GlobalError } from './types';
import {
	handleDBErrors,
	isDBError,
	sendErrorForDev,
	sendErrorForProd,
} from './helpers';

// const ErrorHandler = (
// 	error: GlobalError,
// 	req: Request,
// 	res: Response,
// 	next: NextFunction
// ) => {
// 	error.statusCode = error.statusCode || 500;
// 	const isDbError = isDBError(error);
// 	if (process.env.NODE_ENV === 'development') {
// 		if (isDbError) {
// 			const dbError = handleDBErrors(error);
// 			return sendErrorForDev(dbError!, res);
// 		}
// 		return sendErrorForDev(error, res);
// 	} else if (process.env.NODE_ENV === 'production') {
// 		if (isDbError) {
// 			const dbError = handleDBErrors(error);
// 			return sendErrorForProd(dbError!, res);
// 		}
// 		return sendErrorForProd(error, res);
// 	} else if (process.env.NODE_ENV === 'test') {
// 		if (isDbError) {
// 			const dbError = handleDBErrors(error);
// 			return sendErrorForDev(dbError!, res);
// 		}
// 		return sendErrorForProd(error, res);
// 	}
// };

// export default ErrorHandler;

// import type { NextFunction, Request, Response } from 'express';
// import { GlobalError } from './types';
// import {
// 	handleDBErrors,
// 	isDBError,
// 	sendErrorForDev,
// 	sendErrorForProd,
// } from './helpers';
// import type { NextFunction, Request, Response } from 'express';
// import { GlobalError } from './types';
// import {
// 	handleDBErrors,
// 	isDBError,
// 	sendErrorForDev,
// 	sendErrorForProd,
// } from './helpers';

const ErrorHandler = (
	error: GlobalError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	error.statusCode = error.statusCode || 500;

	const environment = process.env.NODE_ENV || 'production';
	const isDbError = isDBError(error);
	const processedError = isDbError ? handleDBErrors(error) : error;

	if (environment === 'prod') {
		return sendErrorForProd(processedError!, res);
	}
	return sendErrorForDev(processedError!, res);
};

export default ErrorHandler;
