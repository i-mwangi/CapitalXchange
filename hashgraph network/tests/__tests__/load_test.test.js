const { Client, ContractCreateTransaction, ContractExecuteTransaction, ContractFunctionParameters } = require('@hashgraph/sdk');
const { ethers } = require('ethers');

describe('Hedera Smart Contract Load Tests', () => {
  let client;
  let contractId;
  let contractAddress;

  beforeAll(async () => {
    // Initialize Hedera client
    client = Client.forTestnet();
    client.setOperator(
      process.env.OPERATOR_ID,
      process.env.OPERATOR_KEY
    );
  });

  test('should deploy load test contract', async () => {
    // Deploy the contract
    const contractCreate = new ContractCreateTransaction()
      .setGas(100000)
      .setBytecode(process.env.LOAD_TEST_CONTRACT_BYTECODE);

    const contractCreateTx = await contractCreate.execute(client);
    const contractCreateRx = await contractCreateTx.getReceipt(client);
    contractId = contractCreateRx.contractId;
    contractAddress = contractId.toSolidityAddress();

    expect(contractId).toBeDefined();
    expect(contractAddress).toBeDefined();
  }, global.testTimeout);

  test('should execute loop10000 function', async () => {
    const startTime = Date.now();
    
    // Execute loop10000 function
    const loopTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("loop10000");

    const loopRx = await loopTx.execute(client);
    const receipt = await loopRx.getReceipt(client);
    const endTime = Date.now();

    expect(receipt.status).toBe("SUCCESS");
    console.log(`Loop10000 execution time: ${endTime - startTime}ms`);
  }, global.testTimeout);

  test('should store and retrieve large string', async () => {
    const largeString = "A".repeat(1000); // Create a 1000-character string
    
    // Store the string
    const storeTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("storeString",
        new ContractFunctionParameters()
          .addString(largeString)
      );

    const storeRx = await storeTx.execute(client);
    const receipt = await storeRx.getReceipt(client);

    expect(receipt.status).toBe("SUCCESS");

    // Retrieve the stored message
    const getMessageTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("commit_messages",
        new ContractFunctionParameters()
          .addAddress(process.env.OPERATOR_ID)
      );

    const getMessageRx = await getMessageTx.execute(client);
    const result = getMessageRx.getFunctionResult();

    expect(result.getString(1)).toBe(largeString);
  }, global.testTimeout);

  test('should handle concurrent transactions', async () => {
    const numTransactions = 10;
    const promises = [];

    // Create multiple concurrent transactions
    for (let i = 0; i < numTransactions; i++) {
      const message = `Test message ${i}`;
      const storeTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("storeString",
          new ContractFunctionParameters()
            .addString(message)
        );

      promises.push(storeTx.execute(client));
    }

    // Wait for all transactions to complete
    const results = await Promise.all(promises);
    const receipts = await Promise.all(results.map(tx => tx.getReceipt(client)));

    // Verify all transactions were successful
    receipts.forEach(receipt => {
      expect(receipt.status).toBe("SUCCESS");
    });
  }, global.testTimeout);
}); 