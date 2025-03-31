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

# Install Hedera SDK and other Node.js packages
RUN npm install \
    @hashgraph/sdk \
    @hashgraph/json-rpc-relay \
    @hashgraph/consensus-node \
    axios \
    dotenv \
    winston

# Install Python dependencies for monitoring
COPY ./monitoring/requirements.txt /app/monitoring/requirements.txt
RUN pip3 install -r /app/monitoring/requirements.txt

# Copy configuration files
COPY ./config/kenyan-stock-exchange.json /app/config/kenyan-stock-exchange.json
COPY ./config/json-rpc-relay.json /app/config/json-rpc-relay.json

# Copy scripts
COPY ./monitoring/monitor_block_sync.js /app/monitoring/monitor_block_sync.js
COPY ./monitoring/monitor_stock_market.js /app/monitoring/monitor_stock_market.js
COPY ./scripts/run.sh /app/run.sh
COPY ./scripts/healthcheck.sh /app/healthcheck.sh

# Make scripts executable
RUN chmod +x /app/run.sh /app/healthcheck.sh

# Create directories for data and logs
RUN mkdir -p /app/data /app/logs

# Set environment variables
ENV HEDERA_NETWORK=testnet
ENV HEDERA_CHAIN_ID=296
ENV HEDERA_JSON_RPC_URL=http://localhost:8545

# Expose ports
EXPOSE 8545 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# Run the monitoring node
CMD ["/app/run.sh"]
