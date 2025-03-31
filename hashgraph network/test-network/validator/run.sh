#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p /app/logs

# Copy environment file if it doesn't exist
if [ ! -f /app/.env ]; then
    cp /app/.env.example /app/.env
fi

# Start the validator service
cd /app
npm start
