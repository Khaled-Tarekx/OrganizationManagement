import { config } from 'dotenv';

config({
	path: '.env.test',
});

module.exports = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '.',
	testRegex: '\\.test\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: '../coverage',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['./tests/utils/setup.ts'],
	roots: ['<rootDir>/tests'],
};
