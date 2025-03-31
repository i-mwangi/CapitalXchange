# Use Node.js as base image
FROM node:18-slim

# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
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
    winston

# Copy configuration files
COPY config/kenyan-stock-config.json /app/config/
COPY config/json-rpc-relay.json /app/config/

# Copy scripts
COPY run.sh /app/
COPY healthcheck.sh /app/

# Make scripts executable
RUN chmod +x /app/run.sh /app/healthcheck.sh

# Create directories for data and logs
RUN mkdir -p /app/data /app/logs

# Set environment variables
ENV HEDERA_NETWORK=testnet
ENV HEDERA_CHAIN_ID=296
ENV HEDERA_JSON_RPC_URL=https://testnet.hashio.io/api

# Expose ports
EXPOSE 8545 9090

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# Run the monitoring node
CMD ["/app/run.sh"]