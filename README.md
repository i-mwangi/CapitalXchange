# Hedera and Kenyan Stock Market Integration

This project integrates Hedera Hashgraph with the Kenyan Stock Market API.

## Project Structure

- `deploy.js`: Script to deploy smart contracts on Hedera
- `apiCall.js`: Script to interact with the Kenyan Stock API
- `monitoring/monitor_block_sync.js`: Script to monitor Hedera block synchronization
- `.env`: Environment variables (make sure to update with your credentials)
- `config.json`: Configuration settings
- `bytecode.txt`: Smart contract bytecode

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Update `.env` with your credentials:
   ```
   ACCOUNT_ID=your-hedera-account-id
   PRIVATE_KEY=your-hedera-private-key
   KENYAN_STOCK_API_KEY=your-kenyan-stock-api-key
   KENYAN_STOCK_API_ENDPOINT=https://api.kenyanstocks.example.com
   ```

3. Update the bytecode.txt file with your compiled smart contract bytecode

## Usage

- Deploy a smart contract:
  ```
  npm run deploy
  ```

- Call the Kenyan Stock API:
  ```
  npm run stock-api
  ```

- Monitor Hedera block synchronization:
  ```
  npm run monitor
  ``` 