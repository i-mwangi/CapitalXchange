# CapitalXchange - Hedera Hashgraph Network Integration

## Overview
CapitalXchange's Hedera Hashgraph network integration provides a robust infrastructure for real-time stock market data processing and trading on the Hedera network. This network layer ensures secure, transparent, and efficient operations between the Kenya Stock Exchange and Hedera Hashgraph.

## Network Components

### 1. Validator Node
- Handles consensus participation
- Processes transactions
- Maintains network state
- Validates blocks

### 2. General Node
- Stores stock market data
- Handles API requests
- Manages data synchronization
- Provides monitoring services

## Network Configuration

### Environment Setup
```env
# Hedera Network Configuration
HEDERA_NETWORK=testnet
OPERATOR_ID=your_account_id
OPERATOR_KEY=your_private_key
KSE_TOPIC_ID=your_topic_id

# Node Configuration
NODE_PORT=5551
NODE_ENV=development
```

### Network Features
- Real-time data synchronization
- Secure transaction processing
- Automated monitoring
- Health checks
- Error handling

## Directory Structure
```
hashgraph network/
├── validator/           # Validator node configuration
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── general/            # General node configuration
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── monitoring/         # Monitoring services
│   ├── monitor_block_sync.js
│   └── monitor_stock_market.js
└── tests/             # Network tests
    ├── __tests__/
    └── jest.config.js
```

## Setup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/i-mwangi/CapitalXchange.git
cd CapitalXchange/hashgraph\ network
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start the Network**
```bash
# Start validator node
cd validator
npm start

# Start general node
cd ../general
npm start
```

## Monitoring

### Block Sync Monitoring
```bash
npm run monitor:block-sync
```

### Stock Market Monitoring
```bash
npm run monitor:stock-market
```

## Testing

### Run Network Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## Security

### Network Security
- All nodes are authenticated
- Transactions are signed
- Data is encrypted
- Regular security audits

### Access Control
- Role-based access
- API authentication
- Rate limiting
- IP whitelisting

## Maintenance

### Health Checks
- Node status monitoring
- Network connectivity
- Data synchronization
- Performance metrics

### Backup Procedures
- Regular state backups
- Configuration backups
- Data recovery plans

## Deployment

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Manual Deployment
1. Build the nodes:
```bash
npm run build
```

2. Start the services:
```bash
npm start
```

## Troubleshooting

### Common Issues
1. Node Synchronization
   - Check network connectivity
   - Verify Hedera credentials
   - Monitor block sync status

2. Data Processing
   - Check KSE API connectivity
   - Verify data format
   - Monitor processing logs

### Logs
- Node logs: `logs/node.log`
- Sync logs: `logs/sync.log`
- Error logs: `logs/error.log`

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, please contact:
- Email: support@capitalxchange.com
- Website: https://capitalxchange.com
- GitHub Issues: https://github.com/i-mwangi/CapitalXchange/issues

## Acknowledgments
- Hedera Hashgraph Team
- Kenya Stock Exchange
- All contributors to this project
