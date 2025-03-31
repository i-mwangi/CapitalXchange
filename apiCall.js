// apiCall.js
require('dotenv').config();
const axios = require('axios');

async function callKenyanStockAPI() {
  try {
    const response = await axios.get(process.env.KENYAN_STOCK_API_ENDPOINT, {
      headers: {
        'x-api-key': process.env.KENYAN_STOCK_API_KEY
      }
    });
    console.log("Data received from Kenyan Stock API:", response.data);
  } catch (error) {
    console.error("Error calling Kenyan Stock API:", error);
  }
}

callKenyanStockAPI(); 