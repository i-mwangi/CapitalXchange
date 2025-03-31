#!/bin/bash

# Load environment variables
set -a
source /app/.env
set +a

# Create log directory if it doesn't exist
mkdir -p /app/logs

# Set configuration file path
CONFIG_FILE="/app/config/validator.json"

# Start Hedera validator node based on mode
if [ "$VALIDATOR_MODE" = "consensus" ]; then
    echo "Starting Hedera consensus node..."
    node /app/node_modules/@hashgraph/consensus-node/dist/index.js \
        --config $CONFIG_FILE \
        --log-level info \
        > /app/logs/consensus.log 2>&1 &
    CONSENSUS_PID=$!
else
    echo "Starting Hedera JSON-RPC relay..."
    node /app/node_modules/@hashgraph/json-rpc-relay/dist/index.js \
        --config $CONFIG_FILE \
        --log-level info \
        > /app/logs/relay.log 2>&1 &
    RELAY_PID=$!
fi

# Start metrics server
echo "Starting metrics server..."
node /app/node_modules/@hashgraph/consensus-node/dist/metrics.js \
    --config $CONFIG_FILE \
    --port 9090 \
    > /app/logs/metrics.log 2>&1 &
METRICS_PID=$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down services..."
    if [ "$VALIDATOR_MODE" = "consensus" ]; then
        kill $CONSENSUS_PID
    else
        kill $RELAY_PID
    fi
    kill $METRICS_PID
    exit 0
}

# Trap shutdown signals
trap shutdown SIGTERM SIGINT

# Keep container running
while true; do
    if [ "$VALIDATOR_MODE" = "consensus" ]; then
        if ! kill -0 $CONSENSUS_PID 2>/dev/null; then
            echo "Consensus node died, restarting..."
            node /app/node_modules/@hashgraph/consensus-node/dist/index.js \
                --config $CONFIG_FILE \
                --log-level info \
                > /app/logs/consensus.log 2>&1 &
            CONSENSUS_PID=$!
        fi
    else
        if ! kill -0 $RELAY_PID 2>/dev/null; then
            echo "Relay node died, restarting..."
            node /app/node_modules/@hashgraph/json-rpc-relay/dist/index.js \
                --config $CONFIG_FILE \
                --log-level info \
                > /app/logs/relay.log 2>&1 &
            RELAY_PID=$!
        fi
    fi

    if ! kill -0 $METRICS_PID 2>/dev/null; then
        echo "Metrics server died, restarting..."
        node /app/node_modules/@hashgraph/consensus-node/dist/metrics.js \
            --config $CONFIG_FILE \
            --port 9090 \
            > /app/logs/metrics.log 2>&1 &
        METRICS_PID=$!
    fi

    sleep 5
done
