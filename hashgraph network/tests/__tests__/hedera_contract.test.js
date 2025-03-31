const { Client, ContractCreateTransaction, ContractExecuteTransaction, ContractFunctionParameters } = require('@hashgraph/sdk');
const { ethers } = require('ethers');

describe('Hedera Smart Contract Tests', () => {
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

  test('should deploy smart contract', async () => {
    // Deploy the contract
    const contractCreate = new ContractCreateTransaction()
      .setGas(100000)
      .setBytecode(process.env.CONTRACT_BYTECODE)
      .setConstructorParameters(
        new ContractFunctionParameters()
          .addBool(true)
          .addAddress(process.env.OPERATOR_ID)
          .addString("Test String")
          .addUint256(100)
          .addInt256(-100)
          .addBytes32(ethers.utils.formatBytes32String("test"))
      );

    const contractCreateTx = await contractCreate.execute(client);
    const contractCreateRx = await contractCreateTx.getReceipt(client);
    contractId = contractCreateRx.contractId;
    contractAddress = contractId.toSolidityAddress();

    expect(contractId).toBeDefined();
    expect(contractAddress).toBeDefined();
  }, global.testTimeout);

  test('should set and get contract values', async () => {
    // Set values using contract function
    const setItemTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("setItem2",
        new ContractFunctionParameters()
          .addBool(true)
          .addAddress(process.env.OPERATOR_ID)
          .addString("Updated String")
          .addUint256(200)
          .addInt256(-200)
          .addBytes32(ethers.utils.formatBytes32String("updated"))
      );

    await setItemTx.execute(client);

    // Get values using contract function
    const getItemTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("getItem2");

    const getItemRx = await getItemTx.execute(client);
    const result = getItemRx.getFunctionResult();

    expect(result.getBool(0)).toBe(true);
    expect(result.getAddress(1)).toBe(process.env.OPERATOR_ID);
    expect(result.getString(2)).toBe("Updated String");
    expect(result.getUint256(3).toString()).toBe("200");
    expect(result.getInt256(4).toString()).toBe("-200");
    expect(result.getBytes32(5)).toBe(ethers.utils.formatBytes32String("updated"));
  }, global.testTimeout);

  test('should emit events', async () => {
    // Set values and check for event emission
    const setItemTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("setItem2",
        new ContractFunctionParameters()
          .addBool(true)
          .addAddress(process.env.OPERATOR_ID)
          .addString("Event Test")
          .addUint256(300)
          .addInt256(-300)
          .addBytes32(ethers.utils.formatBytes32String("event"))
      );

    const setItemRx = await setItemTx.execute(client);
    const receipt = await setItemRx.getReceipt(client);

    expect(receipt.status).toBe("SUCCESS");
    expect(receipt.events).toBeDefined();
  }, global.testTimeout);
}); 