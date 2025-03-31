const { MirrorClient } = require("@hashgraph/sdk");
const winston = require("winston");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Configure logging
const logDir = path.join(__dirname, "..", "logs");
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

// Initialize Mirror client
const mirrorClient = new MirrorClient(process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet");

let lastConsensusTimestamp = null;
let syncErrors = 0;
const MAX_SYNC_ERRORS = 5;

async function checkBlockSync() {
    try {
        const latestBlock = await mirrorClient.getLatestBlock();
        const currentTimestamp = new Date().getTime();

        if (lastConsensusTimestamp) {
            const timeDiff = currentTimestamp - lastConsensusTimestamp;
            if (timeDiff > parseInt(process.env.MAX_BLOCK_SYNC_DELAY)) {
                syncErrors++;
                logger.warn({
                    message: "Block sync delay exceeded threshold",
                    timeDiff,
                    threshold: process.env.MAX_BLOCK_SYNC_DELAY
                });

                if (syncErrors >= MAX_SYNC_ERRORS) {
                    logger.error({
                        message: "Too many sync errors, restarting service",
                        syncErrors
                    });
                    process.exit(1);
                }
            } else {
                syncErrors = 0;
            }
        }

        lastConsensusTimestamp = currentTimestamp;
        logger.info({
            message: "Block sync check completed",
            latestBlock: latestBlock.number,
            timestamp: currentTimestamp
        });
    } catch (error) {
        logger.error({
            message: "Error checking block sync",
            error: error.message
        });
        syncErrors++;
    }
}

// Start monitoring
setInterval(checkBlockSync, parseInt(process.env.BLOCK_SYNC_CHECK_INTERVAL));

logger.info("Block sync monitoring started"); 