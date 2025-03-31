const { ConsensusNode } = require("@hashgraph/consensus-node");
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
        new winston.transports.File({ filename: path.join(logDir, "validator_monitor.log") }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Initialize validator node
const validatorNode = new ConsensusNode({
    id: process.env.VALIDATOR_ID,
    port: parseInt(process.env.VALIDATOR_PORT),
    grpcPort: parseInt(process.env.VALIDATOR_GRPC_PORT),
    mode: process.env.VALIDATOR_MODE,
    stake: parseInt(process.env.VALIDATOR_STAKE),
    network: process.env.HEDERA_NETWORK
});

let lastConsensusTimestamp = null;
let validatorErrors = 0;
const MAX_VALIDATOR_ERRORS = 5;

async function checkValidatorStatus() {
    try {
        const status = await validatorNode.getStatus();
        const currentTimestamp = new Date().getTime();

        if (lastConsensusTimestamp) {
            const timeDiff = currentTimestamp - lastConsensusTimestamp;
            if (timeDiff > parseInt(process.env.MAX_VALIDATOR_DELAY)) {
                validatorErrors++;
                logger.warn({
                    message: "Validator delay exceeded threshold",
                    timeDiff,
                    threshold: process.env.MAX_VALIDATOR_DELAY
                });

                if (validatorErrors >= MAX_VALIDATOR_ERRORS) {
                    logger.error({
                        message: "Too many validator errors, restarting service",
                        validatorErrors
                    });
                    process.exit(1);
                }
            } else {
                validatorErrors = 0;
            }
        }

        lastConsensusTimestamp = currentTimestamp;
        logger.info({
            message: "Validator status check completed",
            status,
            timestamp: currentTimestamp
        });
    } catch (error) {
        logger.error({
            message: "Error checking validator status",
            error: error.message
        });
        validatorErrors++;
    }
}

// Start monitoring
setInterval(checkValidatorStatus, parseInt(process.env.VALIDATOR_CHECK_INTERVAL));

logger.info("Validator monitoring started"); 