import 'dotenv/config';
import express from 'express';

import connectWithRetry from './src/database/connection';
import Redis from 'redis';
import bootstrap from './src/setup/bootstrap';

connectWithRetry();

export const client = Redis.createClient();
await client.connect();
const port = process.env.PORT;

client.on('error', (err) => console.log('Redis Client Error', err));

export const app = express();
app.use(express.json());
app.listen(port, () => {
	console.log(`App is listening on port ${port}`);
});

bootstrap(app);
