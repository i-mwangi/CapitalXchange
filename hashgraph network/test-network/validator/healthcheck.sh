#!/bin/bash

# Check if Node.js process is running
if ! pgrep -f "node.*monitor_block_sync.js" > /dev/null; then
    echo "Error: Node.js validator process is not running"
    exit 1
fi

# Check if service is responding
if ! curl -s http://localhost:5551/health > /dev/null; then
    echo "Error: Validator service is not responding"
    exit 1
fi

# Check if logs directory is writable
if ! touch /app/logs/test.tmp 2>/dev/null; then
    echo "Error: Logs directory is not writable"
    exit 1
fi
rm -f /app/logs/test.tmp

echo "Validator service is healthy"
exit 0