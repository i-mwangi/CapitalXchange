#!/bin/bash

# Load environment variables
set -a
source /app/.env
set +a

# Check if validator is in consensus mode
if [ "$VALIDATOR_MODE" = "consensus" ]; then
    # Check if consensus node is running
    if ! pgrep -f "@hashgraph/consensus-node" > /dev/null; then
        echo "ERROR: Consensus node is not running"
        exit 1
    fi

    # Check if consensus node is responding
    if ! curl -s http://localhost:50211/status > /dev/null; then
        echo "ERROR: Consensus node is not responding"
        exit 1
    fi
else
    # Check if JSON-RPC relay is running
    if ! pgrep -f "@hashgraph/json-rpc-relay" > /dev/null; then
        echo "ERROR: JSON-RPC relay is not running"
        exit 1
    fi

    # Check if JSON-RPC endpoint is responding
    if ! curl -s -X POST http://localhost:8545 \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null; then
        echo "ERROR: JSON-RPC endpoint is not responding"
        exit 1
    fi
fi

# Check if metrics server is running
if ! curl -s http://localhost:9090/metrics > /dev/null; then
    echo "ERROR: Metrics server is not responding"
    exit 1
fi

# All checks passed
echo "All services are healthy"
exit 0