
import logging
import os
import sys
import time
from logging.config import dictConfig
from datetime import datetime

from requests.exceptions import ConnectionError
from web3 import Web3
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BLOCK_SYNC_MONITORING_INTERVAL = int(os.environ.get("BLOCK_SYNC_MONITORING_INTERVAL", "30"))
MINIMUM_INCREMENTAL_NUMBER = int(os.environ.get("BLOCK_SYNC_MONITORING_MINIMUM_INCREMENTAL_NUMBER", "1"))
KENYAN_STOCK_API_KEY = os.environ.get("KENYAN_STOCK_API_KEY")
KENYAN_STOCK_API_ENDPOINT = os.environ.get("KENYAN_STOCK_API_ENDPOINT")

# Initialize Web3 with Hedera JSON-RPC endpoint
web3 = Web3(Web3.HTTPProvider(os.environ.get("HEDERA_JSON_RPC_URL", "http://localhost:8545")))

LOG_CONFIG = {
    "version": 1,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
        }
    },
    "loggers": {
        "monitor": {
            "handlers": ["console"],
            "propagate": False,
        }
    },
    "root": {
        "level": "INFO",
    },
}
dictConfig(LOG_CONFIG)
log_fmt = "%(levelname)s [%(asctime)s|MONITOR-HEDERA-STOCK] %(message)s"
logging.basicConfig(format=log_fmt)

def check_hedera_sync(start_block_number):
    """Monitor Hedera network synchronization

    :param start_block_number: Monitoring start block number
    :return: Next monitoring start block number
    """
    try:
        latest_block_number = web3.eth.block_number
        if latest_block_number - start_block_number > MINIMUM_INCREMENTAL_NUMBER:
            logging.info(
                f"Hedera blocks are successfully synchronized: "
                f"start={start_block_number}, "
                f"latest={latest_block_number}"
            )
            start_block_number = latest_block_number
        else:
            logging.error(
                f"FATAL: Hedera block number has not been increased: "
                f"start={start_block_number}, "
                f"latest={latest_block_number}"
            )
    except ConnectionError:
        logging.warning("Unable to connect to Hedera node")
    except Exception as err:
        logging.exception(
            "An exception occurred while monitoring Hedera synchronization: ", err
        )
    finally:
        return start_block_number

def check_stock_market_sync():
    """Monitor Kenya Stock Exchange data synchronization"""
    try:
        headers = {"Authorization": f"Bearer {KENYAN_STOCK_API_KEY}"}
        response = requests.get(
            f"{KENYAN_STOCK_API_ENDPOINT}/market-data",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            latest_update = datetime.fromisoformat(data.get("lastUpdate"))
            current_time = datetime.utcnow()
            
            # Check if data is less than 5 minutes old
            if (current_time - latest_update).total_seconds() < 300:
                logging.info("Kenya Stock Exchange data is up to date")
                return True
            else:
                logging.warning("Kenya Stock Exchange data is stale")
                return False
        else:
            logging.error(f"Failed to fetch Kenya Stock Exchange data: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as err:
        logging.exception("Error fetching Kenya Stock Exchange data: ", err)
        return False

def monitor_sync(start_block_number):
    """Monitor both Hedera and Kenya Stock Exchange synchronization

    :param start_block_number: Monitoring start block number
    :return: Next monitoring start block number
    """
    # Check Hedera sync
    start_block_number = check_hedera_sync(start_block_number)
    
    # Check Stock Market sync
    check_stock_market_sync()
    
    return start_block_number

if __name__ == "__main__":
    block_number = 0
    while True:
        start_time = time.time()

        block_number = monitor_sync(start_block_number=block_number)

        elapsed_time = time.time() - start_time
        time.sleep(max(BLOCK_SYNC_MONITORING_INTERVAL - elapsed_time, 0))
