jest.mock('../../src/setup/redisClient', () => {
	const db: Record<any, any> = {};
	const mockRedisClient = {
		connect: jest.fn().mockResolvedValue(true),
		disconnect: jest.fn().mockResolvedValue(true),
		setEx: jest.fn((key, ttl, value) => (db[key] = value)),
		get: jest.fn((key) => db[key]),
	};

	return { redisClient: mockRedisClient };
});
