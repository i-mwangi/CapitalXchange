const { Client, ContractExecuteTransaction } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function loadTestLoop() {
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
    const iterations = [1, 5, 10, 20, 50];
    const results = [];

    for (const iteration of iterations) {
      console.log(`Testing ${iteration} iterations`);
      const iterationResults = [];

      for (let i = 0; i < iteration; i++) {
        const startTime = Date.now();

        // Execute loop10000 function
        const loopTx = new ContractExecuteTransaction()
          .setContractId(contractId)
          .setGas(100000)
          .setFunction("loop10000");

        const loopRx = await loopTx.execute(client);
        const receipt = await loopRx.getReceipt(client);
        const endTime = Date.now();

        const result = {
          iteration: i + 1,
          executionTime: endTime - startTime,
          status: receipt.status,
          gasUsed: receipt.gasUsed
        };

        iterationResults.push(result);
        console.log(`Iteration ${i + 1} completed:`, result);
      }

      // Calculate average execution time
      const avgExecutionTime = iterationResults.reduce(
        (acc, curr) => acc + curr.executionTime,
        0
      ) / iterationResults.length;

      results.push({
        totalIterations: iteration,
        averageExecutionTime: avgExecutionTime,
        results: iterationResults
      });
    }

    // Save results
    fs.writeFileSync(
      path.join(__dirname, 'loop_results.json'),
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
  loadTestLoop()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { loadTestLoop }; 