# Build Hedera validator in a Node.js container
FROM node:20-alpine AS builder

WORKDIR /work

RUN apk add --no-cache git

# Clone Hedera JavaScript SDK examples for reference
RUN git clone https://github.com/hashgraph/hedera-sdk-js.git && \
    cd hedera-sdk-js/ && \
    npm install

# Create a production container with the Hedera validator application
FROM node:20-alpine

RUN apk add --no-cache ca-certificates bash curl jq

# Create app directory
WORKDIR /app

# Install Hedera SDK and other dependencies
COPY ./monitoring/package.json ./package.json
RUN npm install && \
    npm cache clean --force

# Deploy validator and monitoring scripts
COPY ./monitoring/monitor_block_sync.js /app/monitor_block_sync.js
COPY ./monitoring/.env.example /app/.env.example
COPY run.sh /run.sh
COPY healthcheck.sh /healthcheck.sh

# Set permissions
RUN chmod +x /run.sh /healthcheck.sh

# Expose ports
EXPOSE 8545
EXPOSE 50211
EXPOSE 5551

STOPSIGNAL SIGINT
CMD ["/run.sh"]
HEALTHCHECK --interval=30s CMD /healthcheck.sh
