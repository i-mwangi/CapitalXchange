# IBET Network Test Environment

This directory contains the test environment for the IBET Network, which integrates Hedera Hashgraph with the Kenya Stock Exchange.

## Directory Structure

```
test-network/
├── validator/           # Hedera validator node
│   ├── Dockerfile      # Node.js container configuration
│   ├── package.json    # Node.js dependencies
│   ├── .env.example    # Environment configuration template
│   ├── run.sh         # Service startup script
│   ├── healthcheck.sh # Health monitoring script
│   └── monitor_block_sync.js # Block synchronization monitoring
└── README.md          # This file
```

## Prerequisites

- Node.js >= 20.0.0
- Docker
- Hedera Account (for testnet/mainnet)
- Kenya Stock Exchange API access

## Configuration

1. Copy the environment template:
   ```bash
   cp validator/.env.example validator/.env
   ```

2. Update the `.env` file with your credentials:
   - Hedera Operator ID and Key
   - Kenya Stock Exchange API Key
   - Network settings (testnet/mainnet)

## Running the Validator

### Using Docker

```bash
cd validator
docker build -t ibet-validator .
docker run -d \
  --name ibet-validator \
  -p 8545:8545 \
  -p 50211:50211 \
  -p 5551:5551 \
  ibet-validator
```

### Without Docker

```bash
cd validator
npm install
npm start
```

## Monitoring

The validator node provides several monitoring endpoints:

- Health Check: `http://localhost:5551/health`
- Block Sync Status: Check logs in `/app/logs/block_sync.log`

## Features

- Hedera Hashgraph Integration
  - Block synchronization monitoring
  - Transaction validation
  - Network status tracking

- Kenya Stock Exchange Integration
  - Real-time stock data monitoring
  - Price oracle integration
  - Trading data validation

- Monitoring & Logging
  - Block sync monitoring
  - Service health checks
  - Detailed logging system

## Troubleshooting

1. Check the logs:
   ```bash
   docker logs ibet-validator
   ```

2. Verify environment variables:
   ```bash
   docker exec ibet-validator env
   ```

3. Check service health:
   ```bash
   curl http://localhost:5551/health
   ```

## Development

To modify the validator:

1. Update the monitoring logic in `monitor_block_sync.js`
2. Modify environment variables in `.env.example`
3. Update dependencies in `package.json`
4. Rebuild the Docker container

## Security Notes

- Never commit `.env` files with real credentials
- Keep your Hedera private keys secure
- Regularly rotate API keys
- Monitor for suspicious activity

## License

Proprietary - All rights reserved
