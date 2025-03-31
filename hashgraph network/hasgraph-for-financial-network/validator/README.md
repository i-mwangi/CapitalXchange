# Hedera Validator Node for Kenya Stock Exchange

This directory contains the configuration and scripts for running a Hedera validator node that integrates with the Kenya Stock Exchange.

## Overview

The validator node can operate in two modes:
1. **Consensus Mode**: Participates in the Hedera consensus network, validating transactions and ensuring data integrity
2. **Relay Mode**: Serves as a JSON-RPC relay, allowing applications to interact with the Hedera network

## Directory Structure

```
validator/
├── Dockerfile          # Container configuration
├── run.sh             # Main startup script
├── healthcheck.sh     # Health check script
└── config/            # Configuration directory
    ├── validator.json # Validator node configuration
    └── hedera.json    # Hedera network configuration
```

## Configuration

The validator node can be configured through environment variables or the `.env` file:

* `VALIDATOR_MODE` - Operation mode (`consensus` or `relay`)
* `HEDERA_NETWORK` - Network to connect to (`testnet` or `mainnet`)
* `HEDERA_CHAIN_ID` - Chain ID for the network (296 for testnet, 295 for mainnet)
* `HEDERA_NODE_ID` - Node ID in the Hedera network
* `ACCOUNT_ID` - Hedera account ID for transaction signing
* `PRIVATE_KEY` - Private key for the Hedera account
* `KENYAN_STOCK_API_KEY` - API key for the Kenya Stock Exchange
* `KENYAN_STOCK_API_ENDPOINT` - Endpoint URL for the Kenya Stock Exchange API

## Usage

### Running in Consensus Mode

```bash
# Set environment variables
export VALIDATOR_MODE=consensus
export HEDERA_NETWORK=testnet
export HEDERA_CHAIN_ID=296
export HEDERA_NODE_ID=0.0.3
export ACCOUNT_ID=0.0.12345678
export PRIVATE_KEY=your_private_key
export KENYAN_STOCK_API_KEY=your_api_key
export KENYAN_STOCK_API_ENDPOINT=https://api.kenyanstocks.example.com

# Run the validator
./run.sh
```

### Running in Relay Mode

```bash
# Set environment variables
export VALIDATOR_MODE=relay
export HEDERA_NETWORK=testnet
export HEDERA_CHAIN_ID=296
export ACCOUNT_ID=0.0.12345678
export PRIVATE_KEY=your_private_key

# Run the validator
./run.sh
```

## Docker

### Building the Image

```bash
docker build -t hedera-kenya-stock/validator:latest .
```

### Running the Container

```bash
docker run -d --name validator \
    -e VALIDATOR_MODE=consensus \
    -e HEDERA_NETWORK=testnet \
    -e HEDERA_CHAIN_ID=296 \
    -e HEDERA_NODE_ID=0.0.3 \
    -e ACCOUNT_ID=0.0.12345678 \
    -e PRIVATE_KEY=your_private_key \
    -e KENYAN_STOCK_API_KEY=your_api_key \
    -e KENYAN_STOCK_API_ENDPOINT=https://api.kenyanstocks.example.com \
    -v /path/to/config:/app/config \
    -p 8545:8545 -p 50211:50211 -p 9090:9090 \
    hedera-kenya-stock/validator:latest
```

## Monitoring

The validator node exposes metrics on port 9090 at the `/metrics` endpoint. These metrics can be scraped by Prometheus for monitoring.

## Integration with Kenya Stock Exchange

The validator node integrates with the Kenya Stock Exchange by:
1. Validating and processing stock market transactions
2. Storing stock data on the Hedera network
3. Providing secure access to stock market data through the JSON-RPC interface 