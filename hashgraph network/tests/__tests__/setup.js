require('dotenv').config();
const { Client } = require('@hashgraph/sdk');

// Initialize Hedera client
const client = Client.forTestnet();
client.setOperator(
  process.env.OPERATOR_ID,
  process.env.OPERATOR_KEY
);

// Global test configuration
global.hederaClient = client;
global.testTimeout = 30000; // 30 seconds timeout for tests

// Mock console.error to prevent noise in test output
console.error = jest.fn();

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
}); 