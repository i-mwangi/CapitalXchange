// Import required packages
const { Client, AccountId, PrivateKey } = require("@hashgraph/sdk");
const winston = require("winston");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Environment variables with defaults
const BLOCK_SYNC_MONITORING_INTERVAL = process.env.BLOCK_SYNC_MONITORING_INTERVAL || 30;
const MINIMUM_INCREMENTAL_NUMBER = process.env.BLOCK_SYNC_MONITORING_MINIMUM_INCREMENTAL_NUMBER || 1;
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || "testnet";
const OPERATOR_ID = process.env.OPERATOR_ID;
const OPERATOR_KEY = process.env.OPERATOR_KEY;
const KSE_TOPIC_ID = process.env.KSE_TOPIC_ID;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.level.toUpperCase()} [${info.timestamp}|MONITOR-BLOCK-SYNC] ${info.message}`)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Initialize Hedera client
function initHederaClient() {
  if (!OPERATOR_ID || !OPERATOR_KEY) {
    logger.error("Environment variables OPERATOR_ID and OPERATOR_KEY must be present");
    process.exit(1);
  }

  // Create Hedera client
  const client = Client.forNetwork(HEDERA_NETWORK);
  client.setOperator(
    AccountId.fromString(OPERATOR_ID),
    PrivateKey.fromString(OPERATOR_KEY)
  );
  
  return client;
}

// Function to monitor consensus timestamps and KSE market data
async function monitorBlockSync(client, startConsensusTimestamp) {
  try {
    // Get the latest consensus record info
    const recordInfo = await client.getNetworkVersionInfo();
    const latestConsensusTimestamp = recordInfo.consensusTimestamp;
    
    // Calculate the difference (this is simplified - actual implementation would need proper timestamp handling)
    const timeDiff = latestConsensusTimestamp - startConsensusTimestamp;
    
    if (timeDiff > MINIMUM_INCREMENTAL_NUMBER) { // Normal
      logger.info(
        `Blocks are successfully synchronized: ` +
        `start=${startConsensusTimestamp}, ` +
        `latest=${latestConsensusTimestamp}`
      );
      
      // If KSE topic is configured, query and log latest market data
      if (KSE_TOPIC_ID) {
        try {
          // Query latest message from the KSE topic
          const message = await queryLatestKSEMarketData(client, KSE_TOPIC_ID);
          logger.info(`Latest KSE market data: ${JSON.stringify(message)}`);
        } catch (kseError) {
          logger.error(`Failed to fetch KSE market data: ${kseError.message}`);
        }
      }
      
      return latestConsensusTimestamp;
    } else { // Fatal Error
      logger.error(
        `FATAL: Consensus timestamp has not been adequately increased: ` +
        `start=${startConsensusTimestamp}, ` +
        `latest=${latestConsensusTimestamp}`
      );
      return startConsensusTimestamp;
    }
  } catch (error) {
    if (error.name === 'NetworkError') {
      logger.warn("Unable to connect to Hedera network");
    } else {
      logger.error(`An exception occurred while monitoring block synchronization: ${error.message}`);
    }
    return startConsensusTimestamp;
  }
}

// Function to query latest KSE market data from a Hedera topic
async function queryLatestKSEMarketData(client, topicId) {
  const { TopicId, TopicMessageQuery } = require("@hashgraph/sdk");
  
  // Create a TopicMessageQuery to retrieve messages from the specified topic
  const query = new TopicMessageQuery()
    .setTopicId(TopicId.fromString(topicId))
    .setLimit(1); // Only get the most recent message
  
  // Submit the query and get the result
  const messages = await query.execute(client);
  
  if (messages.length > 0) {
    // Decode the message content (assuming it's JSON)
    const messageContent = Buffer.from(messages[0].contents).toString();
    return JSON.parse(messageContent);
  } else {
    return null;
  }
}

// Main function
async function main() {
  try {
    const client = initHederaClient();
    logger.info("Hedera client initialized. Starting KSE market monitoring...");
    
    // Initialize with current time as starting point
    let currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Main monitoring loop
    while (true) {
      const startTime = Date.now();
      
      // Monitor block synchronization
      currentTimestamp = await monitorBlockSync(client, currentTimestamp);
      
      // Calculate elapsed time and sleep
      const elapsedTime = (Date.now() - startTime) / 1000;
      const sleepTime = Math.max(BLOCK_SYNC_MONITORING_INTERVAL - elapsedTime, 0);
      
      await new Promise(resolve => setTimeout(resolve, sleepTime * 1000));
    }
  } catch (error) {
    logger.error(`Fatal error in main process: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  logger.error(`Unhandled exception: ${error.message}`);
  process.exit(1);
});