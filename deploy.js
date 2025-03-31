// deploy.js
require('dotenv').config();
const { Client, AccountId, PrivateKey, ContractCreateFlow } = require('@hashgraph/sdk');
const fs = require('fs');

// Create Hedera client instance for testnet or mainnet based on your config.
// Here we assume testnet; change as needed.
const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.PRIVATE_KEY);
const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

// Load your compiled smart contract bytecode (assumes you have a file "bytecode.txt")
const bytecode = fs.readFileSync("bytecode.txt", "utf8").trim();

async function deployContract() {
  try {
    console.log("Deploying smart contract on Hedera...");
    const contractTx = new ContractCreateFlow()
      .setBytecode(bytecode)
      .setGas(1000000); // Adjust gas limit based on your contract

    const contractResponse = await contractTx.execute(client);
    const contractReceipt = await contractResponse.getReceipt(client);
    const contractId = contractReceipt.contractId;

    console.log("Contract successfully deployed with ID:", contractId.toString());
  } catch (error) {
    console.error("Error deploying contract:", error);
  }
}

deployContract(); 