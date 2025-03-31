#!/bin/bash

# Check if the Node.js process is running
if ! pgrep -f "node.*monitor_block_sync.js" > /dev/null; then
    echo "Node.js monitoring process is not running"
    exit 1
fi

# Check if the service is responding to health check
if ! curl -s http://localhost:5551/health > /dev/null; then
    echo "Service is not responding to health check"
    exit 1
fi

# Check if the logs directory exists and is writable
if [ ! -w /app/logs ]; then
    echo "Logs directory is not writable"
    exit 1
fi

echo "Service is healthy"
exit 0