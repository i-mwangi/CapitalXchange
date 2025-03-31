const { Client, ContractExecuteTransaction, ContractFunctionParameters } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function loadTestLargeStore() {
  try {
    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      process.env.OPERATOR_ID,
      process.env.OPERATOR_KEY
    );

    // Read contract details
    const contractDetails = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'contract_details.json'), 'utf8')
    );
    const contractId = contractDetails.contractId;

    // Test parameters
    const stringSizes = [100, 500, 1000, 5000, 10000];
    const results = [];

    for (const size of stringSizes) {
      console.log(`Testing string size: ${size} characters`);
      const startTime = Date.now();

      // Create test string
      const testString = "A".repeat(size);

      // Store the string
      const storeTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("storeString",
          new ContractFunctionParameters()
            .addString(testString)
        );

      const storeRx = await storeTx.execute(client);
      const receipt = await storeRx.getReceipt(client);
      const endTime = Date.now();

      const result = {
        stringSize: size,
        executionTime: endTime - startTime,
        status: receipt.status,
        gasUsed: receipt.gasUsed
      };

      results.push(result);
      console.log(`Test completed:`, result);
    }

    // Save results
    fs.writeFileSync(
      path.join(__dirname, 'large_store_results.json'),
      JSON.stringify(results, null, 2)
    );

    return results;
  } catch (error) {
    console.error('Error in load test:', error);
    throw error;
  }
}

// Run load test if called directly
if (require.main === module) {
  loadTestLargeStore()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { loadTestLargeStore }; 