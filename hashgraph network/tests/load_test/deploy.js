const { Client, ContractCreateTransaction } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployLoadTestContract() {
  try {
    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      process.env.OPERATOR_ID,
      process.env.OPERATOR_KEY
    );

    // Read contract bytecode
    const bytecodePath = path.join(__dirname, 'contracts', 'LoadTest.sol');
    const bytecode = fs.readFileSync(bytecodePath, 'utf8');

    // Deploy the contract
    const contractCreate = new ContractCreateTransaction()
      .setGas(100000)
      .setBytecode(bytecode);

    const contractCreateTx = await contractCreate.execute(client);
    const contractCreateRx = await contractCreateTx.getReceipt(client);
    const contractId = contractCreateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();

    console.log('Contract deployed successfully:');
    console.log('Contract ID:', contractId.toString());
    console.log('Contract Address:', contractAddress);

    // Save contract details to file
    const contractDetails = {
      contractId: contractId.toString(),
      contractAddress: contractAddress,
      deployTime: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(__dirname, 'contract_details.json'),
      JSON.stringify(contractDetails, null, 2)
    );

    return contractId;
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployLoadTestContract()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployLoadTestContract }; 