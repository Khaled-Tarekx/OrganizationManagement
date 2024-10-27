import 'dotenv/config';

import { createApp } from './src/setup/createApp';
import { redisClient } from './src/setup/redisClient';
import { connectMongodbWithRetry } from './src/database/connection';

const port = process.env.PORT;
const app = createApp();

app.get('/', async (req: any, res: any) => {
	res.status(200).json({ message: 'hello world' });
});

const bootstrap = async () => {
	await redisClient.connect();
	await connectMongodbWithRetry();

	app.listen(port, () => {
		console.log(`App is listening on port ${port}`);
	});
};

bootstrap();
export default app;
