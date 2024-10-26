import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('redis', () => jest.requireActual('redis-mock'));
