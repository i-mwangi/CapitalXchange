/**
 * Hedera-Kenyan Stock Market Integration Script
 * This script connects Hedera blockchain with Kenyan stock market data
 * Created: 2024
 */

require('dotenv').config();
const { 
  Client, 
  AccountId, 
  PrivateKey, 
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
const stockApi = require('./kenyan_stock_api');

// Configuration from environment variables
const accountId = process.env.ACCOUNT_ID;
const privateKey = process.env.PRIVATE_KEY;
const network = process.env.HEDERA_NETWORK || 'testnet';
const dataDir = process.env.DATA_DIRECTORY || '/app/data';
let contractId = process.env.STOCK_DATA_CONTRACT_ID || '';

// Initialize the Hedera client
let client;
if (network.toLowerCase() === 'mainnet') {
  client = Client.forMainnet();
} else {
  client = Client.forTestnet();
}

client.setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey));
console.log(`Hedera client initialized on ${network}`);

/**
 * Deploy a smart contract for storing stock data
 * @returns {Promise<string>} The contract ID
 */
async function deployStockDataContract() {
  try {
    console.log('Deploying stock data contract to Hedera...');
    
    // Read the contract bytecode from the bytecode.txt file
    const bytecode = fs.readFileSync(path.join(__dirname, '../../bytecode.txt'), 'utf8').trim();
    
    // Create the transaction
    const contractTx = new ContractCreateFlow()
      .setBytecode(bytecode)
      .setGas(1000000)
      .setConstructorParameters(new ContractFunctionParameters().addString('Kenyan Stock Market Data'));
    
    // Execute the transaction
    const contractResponse = await contractTx.execute(client);
    
    // Get the receipt
    const contractReceipt = await contractResponse.getReceipt(client);
    
    // Get the contract ID
    const newContractId = contractReceipt.contractId.toString();
    console.log(`Contract deployed successfully with ID: ${newContractId}`);
    
    // Update the contract ID
    contractId = newContractId;
    
    return newContractId;
  } catch (error) {
    console.error(`Error deploying contract: ${error.message}`);
    throw error;
  }
}

/**
 * Store stock data on the Hedera blockchain
 * @param {string} symbol - Stock symbol
 * @param {Object} data - Stock data to store
 * @returns {Promise<object>} Transaction response
 */
async function storeStockDataOnHedera(symbol, data) {
  try {
    // If no contract ID is available, deploy a new contract
    if (!contractId) {
      contractId = await deployStockDataContract();
    }
    
    console.log(`Storing data for ${symbol} on Hedera contract ${contractId}...`);
    
    // Convert data to JSON string
    const dataString = JSON.stringify(data);
    
    // Create the transaction to store data
    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300000)
      .setFunction('storeStockData', new ContractFunctionParameters()
        .addString(symbol)
        .addString(dataString)
        .addUint256(Math.floor(Date.now() / 1000)) // Timestamp
      );
    
    // Execute the transaction
    const response = await transaction.execute(client);
    
    // Get the receipt
    const receipt = await response.getReceipt(client);
    
    console.log(`Data for ${symbol} stored successfully on Hedera. Status: ${receipt.status}`);
    return { receipt, status: 'success' };
  } catch (error) {
    console.error(`Error storing data on Hedera: ${error.message}`);
    return { error: error.message, status: 'error' };
  }
}

/**
 * Process the latest stock data and store it on Hedera
 */
async function processAndStoreStockData() {
  try {
    console.log('Fetching latest stock data...');
    
    // Fetch all stocks from the Kenyan Stock API
    const stocks = await stockApi.fetchStockData();
    
    if (Array.isArray(stocks) && stocks.length > 0) {
      console.log(`Processing ${stocks.length} stocks for Hedera storage...`);
      
      // Process each stock (limited to 3 for demonstration)
      const stocksToProcess = stocks.slice(0, 3);
      
      for (const stock of stocksToProcess) {
        const symbol = stock.symbol || stock.id;
        
        // Get detailed data for this stock
        const detailedData = await stockApi.fetchStockData(symbol);
        
        // Store the data on Hedera
        await storeStockDataOnHedera(symbol, detailedData);
        
        // Wait a bit between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('Stock data successfully processed and stored on Hedera');
    } else {
      console.log('No stocks found or invalid data format');
    }
  } catch (error) {
    console.error(`Error in processing and storing stock data: ${error.message}`);
  }
}

// Run the integration process every 4 hours
const FOUR_HOURS = 4 * 60 * 60 * 1000;
setInterval(processAndStoreStockData, FOUR_HOURS);

// Initial run (delayed by 1 minute to ensure other services are up)
setTimeout(processAndStoreStockData, 60000);

module.exports = {
  deployStockDataContract,
  storeStockDataOnHedera,
  processAndStoreStockData
}; 