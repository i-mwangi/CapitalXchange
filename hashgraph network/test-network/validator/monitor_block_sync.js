const { MirrorClient } = require('@hashgraph/sdk');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure logging
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'block_sync.log') }),
        new winston.transports.Console()
    ]
});

// Initialize Hedera Mirror Client
const mirrorClient = new MirrorClient(process.env.HEDERA_NETWORK === 'mainnet' 
    ? 'https://mainnet.mirrornode.hedera.com/api/v1'
    : 'https://testnet.mirrornode.hedera.com/api/v1'
);

let lastBlockNumber = 0;
let syncErrors = 0;
const MAX_SYNC_ERRORS = 5;

async function checkBlockSync() {
    try {
        const latestBlock = await mirrorClient.getLatestBlock();
        const currentBlockNumber = latestBlock.number;

        if (lastBlockNumber === 0) {
            lastBlockNumber = currentBlockNumber;
            logger.info(`Initial block number: ${currentBlockNumber}`);
            return;
        }

        const blockDiff = currentBlockNumber - lastBlockNumber;
        
        if (blockDiff < process.env.BLOCK_SYNC_MONITORING_MINIMUM_INCREMENTAL_NUMBER) {
            syncErrors++;
            logger.warn(`Block sync delay detected. Current block: ${currentBlockNumber}, Last block: ${lastBlockNumber}`);
            
            if (syncErrors >= MAX_SYNC_ERRORS) {
                logger.error('Too many sync errors detected. Restarting service...');
                process.exit(1);
            }
        } else {
            syncErrors = 0;
            logger.info(`Block sync normal. Current block: ${currentBlockNumber}, Last block: ${lastBlockNumber}`);
        }

        lastBlockNumber = currentBlockNumber;
    } catch (error) {
        logger.error(`Error checking block sync: ${error.message}`);
        syncErrors++;
        
        if (syncErrors >= MAX_SYNC_ERRORS) {
            logger.error('Too many sync errors detected. Restarting service...');
            process.exit(1);
        }
    }
}

// Start monitoring
logger.info('Starting block sync monitoring...');
setInterval(checkBlockSync, process.env.BLOCK_SYNC_MONITORING_INTERVAL || 5000); 