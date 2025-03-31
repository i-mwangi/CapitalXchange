// monitor_block_sync.js
const { Client, AccountId } = require("@hashgraph/sdk");
const axios = require("axios");

// Get configuration from environment variables
const rpcUrl = process.env.HEDERA_JSON_RPC_URL;
const network = process.env.HEDERA_NETWORK;
const chainId = process.env.HEDERA_CHAIN_ID;

console.log(`Monitoring Hedera ${network} network (Chain ID: ${chainId})`);
console.log(`JSON-RPC endpoint: ${rpcUrl}`);

// Function to check block status
async function checkBlockStatus() {
  try {
    const response = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: 1
    });

    if (response.data && response.data.result) {
      const blockNumber = parseInt(response.data.result, 16);
      console.log(`Current block number: ${blockNumber}`);
    } else {
      console.error("Failed to get block number");
    }
  } catch (error) {
    console.error(`Error checking block status: ${error.message}`);
  }
}

// Run check every 30 seconds
setInterval(checkBlockStatus, 30000);

// Initial check
checkBlockStatus(); 