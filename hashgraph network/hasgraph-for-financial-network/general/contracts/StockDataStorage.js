const { ContractCreateTransaction, ContractExecuteTransaction, ContractFunctionParameters, ContractId } = require("@hashgraph/sdk");
const { Client, PrivateKey, AccountId } = require("@hashgraph/sdk");
require('dotenv').config();

class StockDataStorage {
    constructor() {
        this.client = Client.forTestnet();
        this.client.setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
        this.contractId = null;
    }

    /**
     * Deploy the smart contract
     * @returns {Promise<ContractId>} The deployed contract ID
     */
    async deploy() {
        const bytecode = require('./StockDataStorage.json').bytecode;
        
        const transaction = new ContractCreateTransaction()
            .setGas(2000000)
            .setBytecode(bytecode)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addString(process.env.DATA_SOURCE)
            );

        const txResponse = await transaction.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);
        this.contractId = receipt.contractId;
        
        return this.contractId;
    }

    /**
     * Store stock data in the contract
     * @param {string} symbol Stock symbol
     * @param {string} data JSON string containing stock data
     * @param {number} timestamp Timestamp when the data was retrieved
     */
    async storeStockData(symbol, data, timestamp) {
        const transaction = new ContractExecuteTransaction()
            .setContractId(this.contractId)
            .setGas(100000)
            .setFunction(
                "storeStockData",
                new ContractFunctionParameters()
                    .addString(symbol)
                    .addString(data)
                    .addUint256(timestamp)
            );

        await transaction.execute(this.client);
    }

    /**
     * Get stock data by symbol
     * @param {string} symbol Stock symbol to retrieve data for
     * @returns {Promise<{data: string, timestamp: number, updateCount: number}>}
     */
    async getStockData(symbol) {
        const transaction = new ContractExecuteTransaction()
            .setContractId(this.contractId)
            .setGas(100000)
            .setFunction(
                "getStockData",
                new ContractFunctionParameters()
                    .addString(symbol)
            );

        const result = await transaction.execute(this.client);
        const response = await result.getRecord(this.client);
        
        return {
            data: response.contractFunctionResult.getString(0),
            timestamp: response.contractFunctionResult.getUint256(1),
            updateCount: response.contractFunctionResult.getUint256(2)
        };
    }

    /**
     * Get all stock symbols stored in the contract
     * @returns {Promise<string[]>} Array of stock symbols
     */
    async getAllStockSymbols() {
        const transaction = new ContractExecuteTransaction()
            .setContractId(this.contractId)
            .setGas(100000)
            .setFunction("getAllStockSymbols");

        const result = await transaction.execute(this.client);
        const response = await result.getRecord(this.client);
        
        return response.contractFunctionResult.getStringArray(0);
    }

    /**
     * Get the number of stocks stored in the contract
     * @returns {Promise<number>} Number of stocks
     */
    async getStockCount() {
        const transaction = new ContractExecuteTransaction()
            .setContractId(this.contractId)
            .setGas(100000)
            .setFunction("getStockCount");

        const result = await transaction.execute(this.client);
        const response = await result.getRecord(this.client);
        
        return response.contractFunctionResult.getUint256(0);
    }

    /**
     * Update the data source name
     * @param {string} newDataSource New data source name
     */
    async updateDataSource(newDataSource) {
        const transaction = new ContractExecuteTransaction()
            .setContractId(this.contractId)
            .setGas(100000)
            .setFunction(
                "updateDataSource",
                new ContractFunctionParameters()
                    .addString(newDataSource)
            );

        await transaction.execute(this.client);
    }
}

module.exports = StockDataStorage; 