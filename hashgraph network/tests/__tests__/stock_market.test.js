const axios = require('axios');
const { TopicMessageQuery } = require('@hashgraph/sdk');

describe('Kenya Stock Exchange Integration', () => {
  const KSE_API_URL = process.env.KENYA_STOCK_API_URL;
  const KSE_API_KEY = process.env.KENYA_STOCK_API_KEY;
  const STOCK_SYMBOLS = process.env.STOCK_SYMBOLS.split(',');

  test('should fetch stock data from KSE API', async () => {
    const response = await axios.get(`${KSE_API_URL}/stocks`, {
      headers: {
        'Authorization': `Bearer ${KSE_API_KEY}`
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  }, global.testTimeout);

  test('should validate stock data structure', async () => {
    const response = await axios.get(`${KSE_API_URL}/stocks/${STOCK_SYMBOLS[0]}`, {
      headers: {
        'Authorization': `Bearer ${KSE_API_KEY}`
      }
    });

    const stockData = response.data;
    expect(stockData).toHaveProperty('symbol');
    expect(stockData).toHaveProperty('price');
    expect(stockData).toHaveProperty('volume');
    expect(stockData).toHaveProperty('timestamp');
  }, global.testTimeout);

  test('should publish stock data to Hedera topic', async () => {
    const topicId = process.env.KSE_TOPIC_ID;
    const stockData = {
      symbol: STOCK_SYMBOLS[0],
      price: 100.50,
      volume: 1000,
      timestamp: Date.now()
    };

    const message = Buffer.from(JSON.stringify(stockData));
    const transaction = await global.hederaClient
      .newTopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute();

    expect(transaction).toBeDefined();
    expect(transaction.receipt).toBeDefined();
  }, global.testTimeout);
}); 