import 'dotenv/config';
import express from 'express';

import { createApp } from './src/setup/createApp';
import { redisClient } from './src/setup/redisClient';
import { connectMongodbWithRetry } from './src/database/connection';

const port = process.env.PORT;
const app = createApp();

app.get('/', async (req: any, res: any) => {
	res.status(200).json({ message: 'hello world' });
});

const bootstrap = async () => {
	// const app = createApp();
	await redisClient.connect();
	await connectMongodbWithRetry();

	if (process.env.NODE_ENV !== 'prod') {
		app.listen(port, () => {
			console.log(`App is listening on port ${port}`);
		});
	}
};

bootstrap();
export default app;
