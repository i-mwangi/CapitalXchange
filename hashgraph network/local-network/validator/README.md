# IBET Network Validator

Validator node for integrating Hedera Hashgraph with the Kenya Stock Exchange (NSE). It monitors and facilitates trading of Kenyan stocks on the Hedera network.

## Features

- Validator node performance monitoring
- Kenya Stock Exchange price monitoring
- API endpoints for performance monitoring
- Security and performance monitoring

## System Requirements

- Node.js >= 18.0.0
- npm >= 8.0.0
- Hedera account and private keys
- Kenya Stock Exchange API key

## Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/ibet-network.git
cd ibet-network/local-network/validator
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file and set environment variables:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
- Set `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`
- Set `KENYA_STOCK_API_KEY`
- Modify other variables as needed

## Operation

1. Start validator node:
```bash
npm start
```

2. Start monitoring:
```bash
npm run monitor
```

## API Endpoints

- `GET /health` - Check node health
- `GET /status` - Get detailed node status information

## Directory Structure

```
validator/
├── index.js                 # Main program file
├── monitoring/             
│   ├── monitor_validator.js    # Validator performance monitoring
│   └── monitor_stock_market.js  # Stock market monitoring
├── logs/                   # Log directory
├── .env                    # Environment variables
└── package.json           # Project configuration
```

## Monitoring

The program monitors:
- Validator node performance
- Kenya Stock Exchange price changes
- Errors and warnings
- System security

## Security

- Do not store private keys in code files
- Use environment variables for sensitive information
- Monitor logs for errors and warnings

## Support

If you have questions or need assistance, please:
1. Open an issue on GitHub
2. Contact the project team
3. Refer to Hedera and NSE documentation

## License

Apache License 2.0