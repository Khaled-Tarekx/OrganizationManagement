import { ZodError } from 'zod';
import { ValidationError } from './errors/cause.js';
export const validateResource = ({ bodySchema, querySchema, paramsSchema, }) => {
    return async (req, _res, next) => {
        try {
            if (bodySchema) {
                await bodySchema.parseAsync(req.body);
            }
            if (querySchema) {
                await querySchema.parseAsync(req.query);
            }
            if (paramsSchema) {
                await paramsSchema.parseAsync(req.params);
            }
            next();
        }
        catch (err) {
            if (err instanceof ZodError) {
                const errorMessages = err.issues.map((issue) => [
                    issue.path,
                    issue.message,
                ]);
                return next(new ValidationError(errorMessages.join(', ')));
            }
            else {
                return next(err);
            }
        }
    };
};
