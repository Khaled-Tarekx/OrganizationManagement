"use strict";
jest.mock('../../src/setup/redisClient', () => {
    const db = {};
    const mockRedisClient = {
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn().mockResolvedValue(true),
        setEx: jest.fn((key, ttl, value) => (db[key] = value)),
        get: jest.fn((key) => db[key]),
    };
    return { redisClient: mockRedisClient };
});
