#!/bin/bash

# Load environment variables
set -a
source /app/.env
set +a

# Create log directory if it doesn't exist
mkdir -p /app/logs

# Set configuration file paths
KENYAN_STOCK_CONFIG="/app/config/kenyan-stock-config.json"
JSON_RPC_CONFIG="/app/config/json-rpc-relay.json"

# Start the monitoring service
echo "Starting monitoring service..."
node /app/monitoring/hedera_stock_integration.js \
    --config $KENYAN_STOCK_CONFIG \
    --log-level info \
    > /app/logs/monitoring.log 2>&1 &
MONITORING_PID=$!

# Start the JSON-RPC relay service
echo "Starting JSON-RPC relay service..."
node /app/node_modules/@hashgraph/json-rpc-relay/dist/index.js \
    --config $JSON_RPC_CONFIG \
    --log-level info \
    > /app/logs/relay.log 2>&1 &
RELAY_PID=$!

# Start metrics server
echo "Starting metrics server..."
node /app/monitoring/metrics.js \
    --config $KENYAN_STOCK_CONFIG \
    --port 9090 \
    > /app/logs/metrics.log 2>&1 &
METRICS_PID=$!

# Start block sync monitoring
echo "Starting block sync monitoring..."
python /app/monitoring/monitor_block_sync.py \
    > /app/logs/block_sync.log 2>&1 &
BLOCK_SYNC_PID=$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down services..."
    kill $MONITORING_PID
    kill $RELAY_PID
    kill $METRICS_PID
    kill $BLOCK_SYNC_PID
    exit 0
}

# Trap shutdown signals
trap shutdown SIGTERM SIGINT

# Keep container running
while true; do
    if ! kill -0 $MONITORING_PID 2>/dev/null; then
        echo "Monitoring service died, restarting..."
        node /app/monitoring/hedera_stock_integration.js \
            --config $KENYAN_STOCK_CONFIG \
            --log-level info \
            > /app/logs/monitoring.log 2>&1 &
        MONITORING_PID=$!
    fi

    if ! kill -0 $RELAY_PID 2>/dev/null; then
        echo "Relay service died, restarting..."
        node /app/node_modules/@hashgraph/json-rpc-relay/dist/index.js \
            --config $JSON_RPC_CONFIG \
            --log-level info \
            > /app/logs/relay.log 2>&1 &
        RELAY_PID=$!
    fi

    if ! kill -0 $METRICS_PID 2>/dev/null; then
        echo "Metrics server died, restarting..."
        node /app/monitoring/metrics.js \
            --config $KENYAN_STOCK_CONFIG \
            --port 9090 \
            > /app/logs/metrics.log 2>&1 &
        METRICS_PID=$!
    fi

    if ! kill -0 $BLOCK_SYNC_PID 2>/dev/null; then
        echo "Block sync monitoring died, restarting..."
        python /app/monitoring/monitor_block_sync.py \
            > /app/logs/block_sync.log 2>&1 &
        BLOCK_SYNC_PID=$!
    fi

    sleep 5
done
