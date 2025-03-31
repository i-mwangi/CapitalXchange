const { Client, MirrorClient, AccountId, PrivateKey } = require("@hashgraph/sdk");
const winston = require("winston");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Configure logging
const logDir = path.join(__dirname, "logs");
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
        new winston.transports.File({ filename: path.join(logDir, "app.log") }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Initialize Hedera clients
const client = Client.forTestnet();
if (process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY) {
    client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);
}

const mirrorClient = new MirrorClient(process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet");

async function startServices() {
    try {
        // Start monitoring services
        require("./monitoring/monitor_block_sync.js");
        require("./monitoring/monitor_stock_market.js");

        logger.info("All services started successfully");
    } catch (error) {
        logger.error({
            message: "Error starting services",
            error: error.message
        });
        process.exit(1);
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

// Start the application
startServices().catch(error => {
    logger.error({
        message: "Fatal error in main process",
        error: error.message
    });
    process.exit(1);
}); 