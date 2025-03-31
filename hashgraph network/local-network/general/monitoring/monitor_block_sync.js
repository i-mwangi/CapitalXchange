const { Client, MirrorClient, AccountId, PrivateKey } = require("@hashgraph/sdk");
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

// Configure logging
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, "block_sync.log") }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Environment variables
const BLOCK_SYNC_MONITORING_INTERVAL = process.env.BLOCK_SYNC_MONITORING_INTERVAL || 30;
const MINIMUM_INCREMENTAL_NUMBER = process.env.BLOCK_SYNC_MONITORING_MINIMUM_INCREMENTAL_NUMBER || 1;
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || "testnet";
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const KENYAN_STOCK_API_KEY = process.env.KENYAN_STOCK_API_KEY;
const KENYAN_STOCK_API_ENDPOINT = process.env.KENYAN_STOCK_API_ENDPOINT;

// Initialize Hedera clients
const client = Client.forTestnet();
if (HEDERA_ACCOUNT_ID && HEDERA_PRIVATE_KEY) {
    client.setOperator(HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY);
}

const mirrorClient = new MirrorClient(HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet");

async function checkHederaSync(startBlockNumber) {
    try {
        // Get latest block from Hedera
        const latestBlock = await mirrorClient.getLatestBlock();
        const latestBlockNumber = latestBlock.number;

        if (latestBlockNumber - startBlockNumber > MINIMUM_INCREMENTAL_NUMBER) {
            logger.info({
                message: "Hedera blocks are successfully synchronized",
                start: startBlockNumber,
                latest: latestBlockNumber
            });
            startBlockNumber = latestBlockNumber;
        } else {
            logger.error({
                message: "FATAL: Hedera block number has not been increased",
                start: startBlockNumber,
                latest: latestBlockNumber
            });
        }

        // Update last block sync timestamp
        const dataDir = path.join(__dirname, "../../data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(path.join(dataDir, "last_block_sync"), Date.now().toString());

        return startBlockNumber;
    } catch (error) {
        logger.error({
            message: "Error monitoring Hedera sync",
            error: error.message
        });
        return startBlockNumber;
    }
}

async function checkStockMarketSync() {
    try {
        const response = await axios.get(
            `${KENYAN_STOCK_API_ENDPOINT}/market-data`,
            {
                headers: {
                    Authorization: `Bearer ${KENYAN_STOCK_API_KEY}`
                },
                timeout: 10000
            }
        );

        if (response.status === 200) {
            const data = response.data;
            const latestUpdate = new Date(data.lastUpdate);
            const currentTime = new Date();
            
            // Check if data is less than 5 minutes old
            if ((currentTime - latestUpdate) / 1000 < 300) {
                logger.info("Kenya Stock Exchange data is up to date");
                return true;
            } else {
                logger.warning("Kenya Stock Exchange data is stale");
                return false;
            }
        } else {
            logger.error({
                message: "Failed to fetch Kenya Stock Exchange data",
                status: response.status
            });
            return false;
        }
    } catch (error) {
        logger.error({
            message: "Error fetching Kenya Stock Exchange data",
            error: error.message
        });
        return false;
    }
}

async function monitorSync(startBlockNumber) {
    try {
        // Check Hedera sync
        startBlockNumber = await checkHederaSync(startBlockNumber);
        
        // Check Stock Market sync
        await checkStockMarketSync();

        // Check for stock market transactions in the latest block
        const latestBlock = await mirrorClient.getLatestBlock();
        const transactions = await mirrorClient.getBlockTransactions(latestBlock.number);
        
        for (const tx of transactions) {
            if (tx.memo && tx.memo.includes("STOCK_MARKET")) {
                logger.info({
                    message: "Stock market transaction detected",
                    blockNumber: latestBlock.number,
                    transactionId: tx.transaction_id
                });
            }
        }

        return startBlockNumber;
    } catch (error) {
        logger.error({
            message: "Error in monitor sync",
            error: error.message
        });
        return startBlockNumber;
    }
}

async function main() {
    let blockNumber = 0;
    
    while (true) {
        const startTime = Date.now();
        
        blockNumber = await monitorSync(blockNumber);
        
        const elapsedTime = Date.now() - startTime;
        const sleepTime = Math.max(BLOCK_SYNC_MONITORING_INTERVAL * 1000 - elapsedTime, 0);
        await new Promise(resolve => setTimeout(resolve, sleepTime));
    }
}

// Handle process termination
process.on("SIGTERM", () => {
    logger.info("Received SIGTERM signal. Shutting down...");
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("Received SIGINT signal. Shutting down...");
    process.exit(0);
});

// Start monitoring
main().catch(error => {
    logger.error({
        message: "Fatal error in main process",
        error: error.message
    });
    process.exit(1);
}); 