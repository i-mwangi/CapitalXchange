/**
 * Kenyan Stock Market API Interaction Script
 * This script will fetch data from the Kenyan stock market API and process it
 * Created: 2024
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration from environment variables
const apiKey = process.env.KENYAN_STOCK_API_KEY;
const apiEndpoint = process.env.KENYAN_STOCK_API_ENDPOINT;
const dataDir = process.env.DATA_DIRECTORY || '/app/data';

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log(`Kenyan Stock Market API client started`);
console.log(`API Endpoint: ${apiEndpoint}`);

/**
 * Function to fetch stock data from the Kenyan Stock API
 * @param {string} symbol - Stock symbol to fetch data for
 * @returns {Promise<Object>} - The stock data
 */
async function fetchStockData(symbol = '') {
  try {
    const endpoint = symbol ? `${apiEndpoint}/stocks/${symbol}` : `${apiEndpoint}/stocks`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching stock data: ${error.message}`);
    throw error;
  }
}

/**
 * Function to save stock data to a file
 * @param {Object} data - Stock data to save
 * @param {string} symbol - Symbol of the stock (used for filename)
 */
function saveStockData(data, symbol = 'all') {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = path.join(dataDir, `${symbol}_${timestamp}.json`);
    
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Saved stock data to ${filename}`);
  } catch (error) {
    console.error(`Error saving stock data: ${error.message}`);
  }
}

/**
 * Main function to fetch and process stock data
 */
async function processStockData() {
  try {
    // Fetch all stocks
    console.log('Fetching all stock data...');
    const allStocks = await fetchStockData();
    saveStockData(allStocks);
    
    // If the API returns an array of stocks, we can process each one
    if (Array.isArray(allStocks) && allStocks.length > 0) {
      console.log(`Found ${allStocks.length} stocks. Fetching detailed data for each...`);
      
      // We can limit the number of concurrent requests to avoid overwhelming the API
      const stocksToProcess = allStocks.slice(0, 5); // Process only 5 for demonstration
      
      for (const stock of stocksToProcess) {
        const symbol = stock.symbol || stock.id;
        console.log(`Fetching detailed data for ${symbol}...`);
        
        const stockDetail = await fetchStockData(symbol);
        saveStockData(stockDetail, symbol);
        
        // Wait a bit between requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('Stock data processing completed successfully');
  } catch (error) {
    console.error(`Error processing stock data: ${error.message}`);
  }
}

// Run the process every hour
const ONE_HOUR = 60 * 60 * 1000;
setInterval(processStockData, ONE_HOUR);

// Initial run
processStockData();

module.exports = {
  fetchStockData,
  saveStockData,
  processStockData
}; 