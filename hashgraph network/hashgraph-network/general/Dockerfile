# Use Node.js as base image
FROM node:18-slim

# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install Hedera SDK and dependencies
RUN npm install \
    @hashgraph/sdk \
    @hashgraph/json-rpc-relay \
    @hashgraph/consensus-node \
    axios \
    dotenv \
    winston \
    express \
    web3 \
    ethers \
    @openzeppelin/contracts \
    @openzeppelin/upgrades-core \
    @openzeppelin/upgrades-plugins \
    @openzeppelin/hardhat-upgrades \
    hardhat \
    @nomiclabs/hardhat-ethers \
    @nomiclabs/hardhat-waffle \
    chai \
    ethereum-waffle

# Install Python dependencies
COPY monitoring/requirements.txt /app/monitoring/
RUN pip3 install -r /app/monitoring/requirements.txt

# Copy configuration files
COPY config/kenyan-stock-config.json /app/config/
COPY config/json-rpc-relay.json /app/config/
COPY config/hedera-config.json /app/config/
COPY config/stock-market-config.json /app/config/

# Copy scripts
COPY run.sh /app/
COPY healthcheck.sh /app/

# Copy monitoring scripts
COPY monitoring/hedera_stock_integration.js /app/monitoring/
COPY monitoring/metrics.js /app/monitoring/
COPY monitoring/monitor_block_sync.py /app/monitoring/
COPY monitoring/stock_price_monitor.js /app/monitoring/
COPY monitoring/trading_engine.js /app/monitoring/
COPY monitoring/settlement_system.js /app/monitoring/

# Copy smart contracts
COPY contracts/StockRegistry.sol /app/contracts/
COPY contracts/TradingEngine.sol /app/contracts/
COPY contracts/SettlementSystem.sol /app/contracts/
COPY contracts/PriceOracle.sol /app/contracts/
COPY contracts/RiskManager.sol /app/contracts/

# Copy deployment scripts
COPY scripts/deploy.js /app/scripts/
COPY scripts/verify.js /app/scripts/
COPY scripts/upgrade.js /app/scripts/

# Make scripts executable
RUN chmod +x /app/run.sh /app/healthcheck.sh

# Create directories for data and logs
RUN mkdir -p /app/data /app/logs /app/artifacts /app/cache

# Set environment variables
ENV HEDERA_NETWORK=testnet
ENV HEDERA_CHAIN_ID=296
ENV HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api
ENV HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
ENV KENYAN_STOCK_API_URL=https://api.kenyanstocks.example.com
ENV NODE_ENV=production

# Expose ports
EXPOSE 8545 9090 3000

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# Run the monitoring node
CMD ["/app/run.sh"]
