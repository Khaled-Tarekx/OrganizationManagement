import { createClient } from 'redis';
import { RedisClient } from 'redis-mock';

let redisClient: ReturnType<typeof createClient>;

redisClient = createClient({
	url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));

export { redisClient };
