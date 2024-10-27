import { config } from 'dotenv';
import jest from 'jest';

config({
	path: '.env.test',
});

const jestConfig: jest.Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '.',
	testRegex: '\\.test\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: '../coverage',
	testEnvironment: 'node',
	setupFilesAfterEnv: [
		'./tests/utils/setup.ts',
		'./tests/utils/setupMongo.ts',
	],
	roots: ['<rootDir>/tests'],
	globalSetup: '<rootDir>/tests/utils/globalSetup.ts',
	globalTeardown: '<rootDir>/tests/utils/globalTeardown.ts',
};

module.exports = jestConfig;
