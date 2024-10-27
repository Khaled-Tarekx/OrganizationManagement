import 'dotenv/config';
import { createApp } from './src/setup/createApp.js';
import { redisClient } from './src/setup/redisClient.js';
import { connectMongodbWithRetry } from './src/database/connection.js';
const port = process.env.PORT;
const app = createApp();
app.get('/', async (req, res) => {
    res.status(200).json({ message: 'hello world' });
});
const bootstrap = async () => {
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
