# IBET Network Test Suite

This directory contains the test suite for the IBET Network, which validates the integration between Hedera Hashgraph and the Kenya Stock Exchange.

## Directory Structure

```
tests/
├── __tests__/           # Test files
│   ├── setup.js        # Test environment setup
│   ├── block_sync.test.js    # Block synchronization tests
│   └── stock_market.test.js  # Kenya Stock Exchange integration tests
├── package.json        # Node.js dependencies
├── jest.config.js      # Jest configuration
├── .env.example       # Environment configuration template
└── README.md          # This file
```

## Prerequisites

- Node.js >= 20.0.0
- Hedera Account (for testnet/mainnet)
- Kenya Stock Exchange API access

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your credentials:
   - Hedera Operator ID and Key
   - Kenya Stock Exchange API Key
   - Network settings (testnet/mainnet)

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers:

- Block Synchronization
  - Latest block fetching
  - Block sync delay detection
  - Block data structure validation

- Kenya Stock Exchange Integration
  - Stock data fetching
  - Data structure validation
  - Hedera topic publishing

## Development

To add new tests:

1. Create a new test file in `__tests__/`
2. Follow the existing test patterns
3. Use the global Hedera client from setup.js
4. Set appropriate timeouts for async operations

## Troubleshooting

1. Check environment variables:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env)"
   ```

2. Verify Hedera connection:
   ```bash
   node -e "const { Client } = require('@hashgraph/sdk'); const client = Client.forTestnet(); console.log(client)"
   ```

3. Check test logs:
   ```bash
   npm test -- --verbose
   ```

## Security Notes

- Never commit `.env` files with real credentials
- Use test accounts for Hedera operations
- Rotate API keys regularly
- Monitor test execution logs

## License

Proprietary - All rights reserved 