import express from 'express';
import ErrorHandler from '../errors/middleware.js';
import AuthRouter from '../modules/auth/routes.js';
import OrganizationRouter from '../modules/organization/routes.js';
import cors from 'cors';
import { authMiddleware } from '../modules/auth/middleware.js';
const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/api/v1', AuthRouter);
    app.use('/api/v1/organization', authMiddleware, OrganizationRouter);
    app.use(ErrorHandler);
    return app;
};
export { createApp };
