# IBET Network

This project integrates Hedera Hashgraph with the Kenya Stock Exchange (NSE). It monitors and facilitates trading of Kenyan stocks on the Hedera network.

## Features

- Block synchronization monitoring for Hedera
- Kenya Stock Exchange price monitoring
- Stock trading capabilities on Hedera network
- Performance and security monitoring

## System Requirements

- Node.js >= 18.0.0
- npm >= 8.0.0
- Hedera account and private keys
- Kenya Stock Exchange API key

## Installation

1. Clone repository:
```bash
git clone https://github.com/yourusername/ibet-network.git
cd ibet-network/local-network
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

1. Start the application:
```bash
npm start
```

2. Start monitoring:
```bash
npm run monitor
```

## Directory Structure

```
local-network/
├── index.js                 # Main program file
├── monitoring/             
│   ├── monitor_block_sync.js    # Block synchronization monitoring
│   └── monitor_stock_market.js  # Stock market monitoring
├── logs/                   # Log directory
├── .env                    # Environment variables
└── package.json           # Project configuration
```

## Monitoring

The program monitors:
- Hedera block synchronization
- Kenya Stock Exchange price changes
- System performance
- Errors and warnings

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

# local network

You can use the docker-compose file which runs on Ubuntu.
Please edit the docker-compose file to suit your environment and use it.

By running this docker-compose, the Validator node will start with 4 nodes. 
Please check the file itself for detailed configuration.

## Starting and Stopping the Server
You can start the local network with:
```
$ docker-compose up -d
```

You can stop the local network with:
```
$ docker-compose stop
```

## Migrate from IBFT to QBFT
You can migrate an existing IBFT network to a QBFT network with the following steps:

1. Stop the network.
2. Update the docker-compose file with a non-zero `testQBFTBlock`.
 For example, if the current block number in your IBFT network is 100, set `testQBFTBlock` to any block greater than 100, and once that fork block is reached, QBFT consensus will be used instead of IBFT.
3. Restart the network.

## Berlin hardfork setting
You can migrate an existing network to a Berlin hardfork network with the following steps:

1. Stop the network.
2. Update the docker-compose file with a non-zero `berlinBlock`.
 Set a future block number rather than the current block number.
3. Restart the network.

## Introducing Empty Block Period Seconds
You can introduce empty block period to an existing network with the following steps:

1. Stop the network.
2. Update the docker-compose file with a non-zero `emptyBlockPeriodIntroduceBlock`.
 Set a future block number rather than the current block number.
3. Restart the network.
