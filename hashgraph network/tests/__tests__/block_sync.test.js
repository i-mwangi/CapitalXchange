const { MirrorClient } = require('@hashgraph/sdk');
const axios = require('axios');

describe('Block Synchronization', () => {
  let mirrorClient;

  beforeAll(() => {
    mirrorClient = new MirrorClient(process.env.HEDERA_NETWORK === 'mainnet'
      ? 'https://mainnet.mirrornode.hedera.com/api/v1'
      : 'https://testnet.mirrornode.hedera.com/api/v1'
    );
  });

  test('should fetch latest block', async () => {
    const latestBlock = await mirrorClient.getLatestBlock();
    expect(latestBlock).toBeDefined();
    expect(latestBlock.number).toBeGreaterThan(0);
  }, global.testTimeout);

  test('should detect block sync delay', async () => {
    const block1 = await mirrorClient.getLatestBlock();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const block2 = await mirrorClient.getLatestBlock();
    
    const blockDiff = block2.number - block1.number;
    expect(blockDiff).toBeGreaterThanOrEqual(0);
  }, global.testTimeout);

  test('should validate block data structure', async () => {
    const block = await mirrorClient.getLatestBlock();
    expect(block).toHaveProperty('number');
    expect(block).toHaveProperty('timestamp');
    expect(block).toHaveProperty('hash');
  }, global.testTimeout);
}); 