const axios = require("axios");
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
        new winston.transports.File({ filename: path.join(logDir, "stock_market.log") }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

const STOCK_SYMBOLS = process.env.STOCK_SYMBOLS.split(",");
let lastPrices = new Map();

async function fetchStockData(symbol) {
    try {
        const response = await axios.get(`${process.env.KENYA_STOCK_API_URL}/stocks/${symbol}`, {
            headers: {
                "Authorization": `Bearer ${process.env.KENYA_STOCK_API_KEY}`
            }
        });

        return response.data;
    } catch (error) {
        logger.error({
            message: `Error fetching data for ${symbol}`,
            error: error.message
        });
        return null;
    }
}

async function checkPriceChanges() {
    for (const symbol of STOCK_SYMBOLS) {
        const currentData = await fetchStockData(symbol);
        if (!currentData) continue;

        const currentPrice = currentData.price;
        const lastPrice = lastPrices.get(symbol);

        if (lastPrice) {
            const priceChange = Math.abs(currentPrice - lastPrice);
            const priceChangePercent = (priceChange / lastPrice) * 100;

            if (priceChangePercent > parseFloat(process.env.MAX_PRICE_CHANGE_PERCENT)) {
                logger.warn({
                    message: `Significant price change detected for ${symbol}`,
                    symbol,
                    currentPrice,
                    lastPrice,
                    priceChangePercent
                });
            }
        }

        lastPrices.set(symbol, currentPrice);
    }
}

async function monitorStockMarket() {
    try {
        await checkPriceChanges();
        logger.info("Stock market monitoring completed successfully");
    } catch (error) {
        logger.error({
            message: "Error in stock market monitoring",
            error: error.message
        });
    }
}

// Start monitoring
setInterval(monitorStockMarket, parseInt(process.env.STOCK_MARKET_CHECK_INTERVAL));

logger.info("Stock market monitoring started"); 