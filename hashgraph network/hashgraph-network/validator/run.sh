#!/bin/bash

# Create necessary directories
mkdir -p /app/data /app/logs

# Set environment variables
export HEDERA_NETWORK=${HEDERA_NETWORK:-"testnet"}
export HEDERA_CHAIN_ID=${HEDERA_CHAIN_ID:-"296"}
export KENYAN_STOCK_API_KEY=${KENYAN_STOCK_API_KEY:-""}
export KENYAN_STOCK_API_ENDPOINT=${KENYAN_STOCK_API_ENDPOINT:-"https://api.kenyanstocks.example.com"}

# Start Hedera Node
echo "Starting Hedera Node..."
nohup node /app/hedera-node.js > /app/logs/hedera.log 2>&1 &
HEDERA_PID=$!

# Start JSON-RPC Relay
echo "Starting JSON-RPC Relay..."
nohup node /app/json-rpc-relay.js > /app/logs/relay.log 2>&1 &
RELAY_PID=$!

# Start Stock Market Monitor
echo "Starting Stock Market Monitor..."
nohup python3 /app/monitoring/monitor_stock_market.py > /app/logs/stock_market.log 2>&1 &
STOCK_MONITOR_PID=$!

# Start Block Sync Monitor
echo "Starting Block Sync Monitor..."
nohup python3 /app/monitoring/monitor_block_sync.py > /app/logs/block_sync.log 2>&1 &
BLOCK_SYNC_PID=$!

# Start API Gateway
echo "Starting API Gateway..."
nohup node /app/api-gateway.js > /app/logs/api.log 2>&1 &
API_PID=$!

# Function to check if a process is running
check_process() {
    local pid=$1
    local name=$2
    if ! ps -p $pid > /dev/null; then
        echo "Error: $name process died"
        return 1
    fi
    return 0
}

# Function to gracefully shutdown all services
shutdown() {
    echo "Shutting down services..."
    
    # Kill all processes
    kill -SIGTERM $HEDERA_PID 2>/dev/null
    kill -SIGTERM $RELAY_PID 2>/dev/null
    kill -SIGTERM $STOCK_MONITOR_PID 2>/dev/null
    kill -SIGTERM $BLOCK_SYNC_PID 2>/dev/null
    kill -SIGTERM $API_PID 2>/dev/null
    
    # Wait for processes to terminate
    wait $HEDERA_PID $RELAY_PID $STOCK_MONITOR_PID $BLOCK_SYNC_PID $API_PID 2>/dev/null
    
    echo "All services stopped"
    exit 0
}

# Set up trap for shutdown signals
trap shutdown SIGTERM SIGINT

# Main loop to monitor services
while true; do
    # Check each service
    check_process $HEDERA_PID "Hedera Node" || exit 1
    check_process $RELAY_PID "JSON-RPC Relay" || exit 1
    check_process $STOCK_MONITOR_PID "Stock Market Monitor" || exit 1
    check_process $BLOCK_SYNC_PID "Block Sync Monitor" || exit 1
    check_process $API_PID "API Gateway" || exit 1
    
    # Check system resources
    if [ $(free -m | awk '/^Mem:/ {print $3}') -gt 2048 ]; then
        echo "Warning: High memory usage detected"
    fi
    
    if [ $(df -h / | awk 'NR==2 {print $5}' | sed 's/%//') -gt 85 ]; then
        echo "Warning: High disk usage detected"
    fi
    
    # Check if stock market data is being updated
    if [ ! -f "/app/data/last_stock_update" ] || [ $(($(date +%s) - $(cat /app/data/last_stock_update))) -gt 600 ]; then
        echo "Warning: Stock market data not updated in last 10 minutes"
    fi
    
    # Check if block sync is within acceptable range
    if [ ! -f "/app/data/last_block_sync" ] || [ $(($(date +%s) - $(cat /app/data/last_block_sync))) -gt 300 ]; then
        echo "Warning: Block sync not updated in last 5 minutes"
    fi
    
    sleep 5
done
