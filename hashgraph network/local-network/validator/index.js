const { Client, MirrorClient, AccountId, PrivateKey } = require("@hashgraph/sdk");
const { ConsensusNode } = require("@hashgraph/consensus-node");
const express = require("express");
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
        new winston.transports.File({ filename: path.join(logDir, "validator.log") }),
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

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize validator node
const validatorNode = new ConsensusNode({
    id: process.env.VALIDATOR_ID,
    port: parseInt(process.env.VALIDATOR_PORT),
    grpcPort: parseInt(process.env.VALIDATOR_GRPC_PORT),
    mode: process.env.VALIDATOR_MODE,
    stake: parseInt(process.env.VALIDATOR_STAKE),
    network: process.env.HEDERA_NETWORK
});

// API endpoints
app.get("/health", (req, res) => {
    res.json({ status: "healthy" });
});

app.get("/status", async (req, res) => {
    try {
        const status = await validatorNode.getStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start validator node
async function startValidator() {
    try {
        await validatorNode.start();
        logger.info("Validator node started successfully");

        // Start monitoring services
        require("./monitoring/monitor_validator.js");
        require("./monitoring/monitor_stock_market.js");

        // Start Express server
        const port = process.env.VALIDATOR_PORT || 8545;
        app.listen(port, () => {
            logger.info(`Validator API server running on port ${port}`);
        });
    } catch (error) {
        logger.error({
            message: "Error starting validator node",
            error: error.message
        });
        process.exit(1);
    }
}

// Handle process termination
process.on("SIGTERM", async () => {
    logger.info("Received SIGTERM signal. Shutting down...");
    await validatorNode.stop();
    process.exit(0);
});

process.on("SIGINT", async () => {
    logger.info("Received SIGINT signal. Shutting down...");
    await validatorNode.stop();
    process.exit(0);
});

// Start the application
startValidator().catch(error => {
    logger.error({
        message: "Fatal error in validator process",
        error: error.message
    });
    process.exit(1);
}); 