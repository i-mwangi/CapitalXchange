#!/bin/bash

# Load environment variables
set -a
source /app/.env
set +a

# Check if Hedera JSON-RPC relay is running
if ! pgrep -f "@hashgraph/json-rpc-relay" > /dev/null; then
    echo "ERROR: Hedera JSON-RPC relay is not running"
    exit 1
fi

# Check if Hedera JSON-RPC endpoint is responding
if ! curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null; then
    echo "ERROR: Hedera JSON-RPC endpoint is not responding"
    exit 1
fi

# Check if monitoring service is running
if ! pgrep -f "monitor_block_sync.py" > /dev/null; then
    echo "ERROR: Monitoring service is not running"
    exit 1
fi

# Check if metrics server is running
if ! curl -s http://localhost:9090/metrics > /dev/null; then
    echo "ERROR: Metrics server is not responding"
    exit 1
fi

# Check if Kenya Stock Exchange API is accessible
if ! curl -s -H "Authorization: Bearer $KENYAN_STOCK_API_KEY" \
    "$KENYAN_STOCK_API_ENDPOINT/status" > /dev/null; then
    echo "ERROR: Kenya Stock Exchange API is not accessible"
    exit 1
fi

# All checks passed
echo "All services are healthy"
exit 0