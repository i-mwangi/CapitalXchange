#!/bin/bash

# Check Hedera Node
ps -ef | grep -v grep | grep "hedera-node" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: Hedera Node Not Running." 1>&2
  exit 1
fi

# Check JSON-RPC Relay
ps -ef | grep -v grep | grep "json-rpc-relay" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: JSON-RPC Relay Not Running." 1>&2
  exit 1
fi

# Check Stock Market Monitor
ps -ef | grep -v grep | grep "monitor_stock_market.py" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: Stock Market Monitor Not Running." 1>&2
  exit 1
fi

# Check Block Sync Monitor
ps -ef | grep -v grep | grep "monitor_block_sync.py" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: Block Sync Monitor Not Running." 1>&2
  exit 1
fi

# Check API Gateway
ps -ef | grep -v grep | grep "api-gateway" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: API Gateway Not Running." 1>&2
  exit 1
fi

# Check if all services are healthy
curl -s http://localhost:9090/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: Hedera Node Health Check Failed." 1>&2
  exit 1
fi

curl -s http://localhost:8545/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: JSON-RPC Relay Health Check Failed." 1>&2
  exit 1
fi

curl -s http://localhost:3000/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$0: API Gateway Health Check Failed." 1>&2
  exit 1
fi

# Check if stock market data is being updated
if [ ! -f "/app/data/last_stock_update" ] || [ $(($(date +%s) - $(cat /app/data/last_stock_update))) -gt 600 ]; then
  echo "$0: Stock Market Data Not Updated in Last 10 Minutes." 1>&2
  exit 1
fi

# Check if block sync is within acceptable range
if [ ! -f "/app/data/last_block_sync" ] || [ $(($(date +%s) - $(cat /app/data/last_block_sync))) -gt 300 ]; then
  echo "$0: Block Sync Not Updated in Last 5 Minutes." 1>&2
  exit 1
fi

# Check system resources
if [ $(free -m | awk '/^Mem:/ {print $3}') -gt 2048 ]; then
  echo "$0: High Memory Usage Detected." 1>&2
  exit 1
fi

if [ $(df -h / | awk 'NR==2 {print $5}' | sed 's/%//') -gt 85 ]; then
  echo "$0: High Disk Usage Detected." 1>&2
  exit 1
fi

# All checks passed
echo "$0: All Services Healthy."
exit 0