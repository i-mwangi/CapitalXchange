# Hedera Monitoring Node for Kenya Stock Exchange

This directory contains the configuration and scripts for running a monitoring node that integrates the Kenya Stock Exchange with the Hedera network.

## Overview

The monitoring node performs the following functions:
1. Fetches stock data from the Kenya Stock Exchange API
2. Stores the data on the Hedera network
3. Provides metrics and health status of the integration
4. Serves as a JSON-RPC relay for applications

## Directory Structure

```
general/
├── Dockerfile              # Container configuration
├── run.sh                 # Main startup script
├── healthcheck.sh         # Health check script
├── config/                # Configuration directory
│   ├── kenyan-stock-config.json  # Kenya Stock Exchange configuration
│   └── json-rpc-relay.json      # JSON-RPC relay configuration
└── monitoring/            # Monitoring scripts
    ├── hedera_stock_integration.js  # Main integration script
    └── metrics.js                   # Metrics collection script
```

## Configuration

The monitoring node can be configured through environment variables or the `.env` file:

* `HEDERA_NETWORK` - Network to connect to (`testnet` or `mainnet`)
* `HEDERA_CHAIN_ID` - Chain ID for the network (296 for testnet, 295 for mainnet)
* `HEDERA_JSON_RPC_URL` - URL of the Hedera JSON-RPC endpoint
* `KENYAN_STOCK_API_KEY` - API key for the Kenya Stock Exchange
* `KENYAN_STOCK_API_ENDPOINT` - Endpoint URL for the Kenya Stock Exchange API

## Usage

### Running the Monitoring Node

```bash
# Set environment variables
export HEDERA_NETWORK=testnet
export HEDERA_CHAIN_ID=296
export HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api
export KENYAN_STOCK_API_KEY=your_api_key
export KENYAN_STOCK_API_ENDPOINT=https://api.kenyanstocks.example.com

# Run the monitoring node
./run.sh
```

## Docker

### Building the Image

```bash
docker build -t hedera-kenya-stock/monitor:latest .
```

### Running the Container

```bash
docker run -d --name monitor \
    -e HEDERA_NETWORK=testnet \
    -e HEDERA_CHAIN_ID=296 \
    -e HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api \
    -e KENYAN_STOCK_API_KEY=your_api_key \
    -e KENYAN_STOCK_API_ENDPOINT=https://api.kenyanstocks.example.com \
    -v /path/to/config:/app/config \
    -p 8545:8545 -p 9090:9090 \
    hedera-kenya-stock/monitor:latest
```

## Monitoring

The monitoring node exposes metrics on port 9090 at the `/metrics` endpoint. These metrics include:
- Stock data synchronization status
- API response times
- Error rates
- Network connectivity status

## Integration with Kenya Stock Exchange

The monitoring node integrates with the Kenya Stock Exchange by:
1. Fetching stock data at regular intervals
2. Validating the data against the Hedera network
3. Storing the data in a format accessible through the JSON-RPC interface
4. Providing real-time monitoring of the integration status 