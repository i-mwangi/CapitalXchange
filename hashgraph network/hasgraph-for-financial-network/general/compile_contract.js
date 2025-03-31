/**
 * Compile Stock Data Storage Contract
 * This script compiles the Solidity smart contract and saves the bytecode to a file
 */

const fs = require('fs');
const path = require('path');
const solc = require('solc');

// Path to the contract file
const contractPath = path.join(__dirname, 'contracts', 'StockDataStorage.sol');

// Read the contract source code
const contractSource = fs.readFileSync(contractPath, 'utf8');

// Input configuration for the Solidity compiler
const input = {
  language: 'Solidity',
  sources: {
    'StockDataStorage.sol': {
      content: contractSource
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    },
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};

console.log('Compiling the contract...');

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  output.errors.forEach(error => {
    console.error(error.formattedMessage);
  });
  if (output.errors.some(error => error.severity === 'error')) {
    console.error('Compilation failed due to Solidity errors');
    process.exit(1);
  }
}

// Get the contract
const contractOutput = output.contracts['StockDataStorage.sol']['StockDataStorage'];

// Get bytecode and ABI
const bytecode = contractOutput.evm.bytecode.object;
const abi = contractOutput.abi;

// Save bytecode to file
fs.writeFileSync(path.join(__dirname, 'bytecode.txt'), '0x' + bytecode);
console.log('Bytecode saved to bytecode.txt');

// Save ABI to file
fs.writeFileSync(
  path.join(__dirname, 'StockDataStorage.json'),
  JSON.stringify({ abi }, null, 2)
);
console.log('ABI saved to StockDataStorage.json');

console.log('Compilation completed successfully!'); 