import 'dotenv/config';
import express from 'express';

import { createApp } from './src/setup/createApp';
import { redisClient } from './src/setup/redisClient';
import { connectMongodbWithRetry } from './src/database/connection';

const port = process.env.PORT;

export const app = express();

const bootstrap = async () => {
	const app = createApp();
	await redisClient.connect();
	await connectMongodbWithRetry();
	app.get('/', async (req: any, res: any, next: any) => {
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
