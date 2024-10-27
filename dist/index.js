import 'dotenv/config';
import express from 'express';
import { createApp } from './src/setup/createApp.js';
import { redisClient } from './src/setup/redisClient.js';
import { connectMongodbWithRetry } from './src/database/connection.js';
const port = process.env.PORT;
export const app = express();
const bootstrap = async () => {
    const app = createApp();
    await redisClient.connect();
    await connectMongodbWithRetry();
    app.get('/', async (req, res, next) => {
        res.status(200).json({ message: 'hello world' });
    });
    app.listen(port, () => {
        console.log(`App is listening on port ${port}`);
    });
};
bootstrap();
// "config": {
//   "mongodbMemoryServer": {
//     "debug": "1"
//   }
// },
