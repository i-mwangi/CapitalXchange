# Hedera Network for Kenya Stock Exchange Integration

**Hedera for Kenya Stock Exchange** is a network that enables financial institutions to integrate with the Kenya Stock Exchange using Hedera Hashgraph distributed ledger technology.
This platform facilitates the secure trading, settlement, and recording of stock transactions on an immutable distributed ledger.

### 3 types of nodes

The Hedera Kenya Stock Exchange network consists of 3 types of nodes:

#### Validator
- Validates stock market transactions and ensures data integrity
- Operates in two modes: consensus node (participating in Hedera consensus) or relay node
- Securely stores Kenya Stock Exchange data on the Hedera network

#### JSON-RPC Relay
- Serves as a gateway between applications and the Hedera network
- Provides Ethereum-compatible JSON-RPC endpoints
- Enables interaction with smart contracts deployed on Hedera

#### Monitoring
- Tracks synchronization with the Hedera network
- Retrieves and stores Kenya Stock Exchange data
- Provides metrics and health status of the network

---

## 1. Common settings

Common to all node types, you need to set the following environment variables:

* `HEDERA_NETWORK` - Network to connect to (`testnet` or `mainnet`)
* `HEDERA_CHAIN_ID` - Chain ID for the network (296 for testnet, 295 for mainnet)
* `ACCOUNT_ID` - Hedera account ID for transaction signing
* `PRIVATE_KEY` - Private key for the Hedera account
* `KENYAN_STOCK_API_KEY` - API key for the Kenya Stock Exchange
* `KENYAN_STOCK_API_ENDPOINT` - Endpoint URL for the Kenya Stock Exchange API

## 2. Start/Stop Validator node

### Set up

Pull docker image for validator nodes:
```
$ docker pull ghcr.io/your-organization/hedera-kenya-stock/validator:latest
```

Make a volume mount directory for the docker container:
```
$ mkdir -p {mount_directory}/config
```

Create or copy configuration files:
- `{mount_directory}/config/validator.json` - Configuration for the validator node
- `{mount_directory}/config/hedera.json` - Hedera network configuration

### Start validator node 

Start the node as follows:
```bash
$ docker run -d --name validator \
    -e VALIDATOR_MODE=consensus \
    -e HEDERA_NETWORK=testnet \
    -e HEDERA_CHAIN_ID=296 \
    -e HEDERA_NODE_ID=0.0.3 \
    -e ACCOUNT_ID=0.0.12345678 \
    -e PRIVATE_KEY=your_private_key \
    -e KENYAN_STOCK_API_KEY=your_api_key \
    -e KENYAN_STOCK_API_ENDPOINT=https://api.kenyanstocks.example.com \
    -v {mount_directory}:/app/data \
    -p 8545:8545 -p 50211:50211 -p 9090:9090 \
    ghcr.io/your-organization/hedera-kenya-stock/validator:latest
```

### Stop validator node 

When stopping a node, simply stop the container:
```
$ docker stop validator
```

## 3. Start/Stop JSON-RPC Relay node

### Set up

Pull docker image for JSON-RPC relay nodes:
```
$ docker pull ghcr.io/your-organization/hedera-kenya-stock/json-rpc-relay:latest
```

Make a volume mount directory for the docker container:
```
$ mkdir -p {mount_directory}/config
```

Create or copy configuration files:
- `{mount_directory}/config/json-rpc-relay.json` - Configuration for the JSON-RPC relay

### Start node

Start the node as follows:
```bash
$ docker run -d --name relay \
    -e HEDERA_NETWORK=testnet \
    -e HEDERA_CHAIN_ID=296 \
    -e ACCOUNT_ID=0.0.12345678 \
    -e PRIVATE_KEY=your_private_key \
    -v {mount_directory}:/app/config \
    -p 8545:8545 \
    ghcr.io/your-organization/hedera-kenya-stock/json-rpc-relay:latest
```

### Stop node 
When stopping a node, simply stop the container:
```
$ docker stop relay
```

## 4. Start/Stop Monitoring node

### Set up

Pull docker image for monitoring nodes:
```
$ docker pull ghcr.io/your-organization/hedera-kenya-stock/general:latest
```

Make a volume mount directory for the docker container:
```
$ mkdir -p {mount_directory}/data
```

### Start node

Start the node as follows:
```bash
$ docker run -d --name monitor \
    -e HEDERA_NETWORK=testnet \
    -e HEDERA_CHAIN_ID=296 \
    -e HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api \
    -e KENYAN_STOCK_API_KEY=your_api_key \
    -e KENYAN_STOCK_API_ENDPOINT=https://api.kenyanstocks.example.com \
    -v {mount_directory}:/app/data \
    ghcr.io/your-organization/hedera-kenya-stock/general:latest
```

### Stop node 
When stopping a node, simply stop the container:
```
$ docker stop monitor
```

## 5. Kenya Stock Exchange Integration

The system integrates with the Kenya Stock Exchange through the following components:

1. **Data Collection**: The monitoring node fetches stock data from the Kenya Stock Exchange API at regular intervals.

2. **Smart Contract Storage**: Stock data is stored on the Hedera network using smart contracts, providing an immutable record of stock prices and transactions.

3. **Transaction Validation**: The validator node ensures the integrity of the stock data transactions.

4. **API Access**: Applications can interact with the stored stock data through the JSON-RPC relay node.

The integration leverages Hedera's security, speed, and immutability to provide a reliable infrastructure for Kenya Stock Exchange data and transactions.
