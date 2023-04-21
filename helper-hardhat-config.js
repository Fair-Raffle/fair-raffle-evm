const { ethers } = require('hardhat')

const networkConfig = {
  default: {
    name: 'hardhat',
  },
  1337: {
    name: 'ganache',
    subscriptionId: '1',
    gasLane:
      '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c', // 30 gwei
    callbackGasLimit: '2500000',
  },
  11155111: {
    name: 'sepolia',
    subscriptionId: '1015',
    gasLane:
      '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c', // 30 gwei
    callbackGasLimit: '500000',
    vrfCoordinatorV2: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
  },
  1: {
    name: 'mainnet',
  },
}

const developmentChains = ['hardhat', 'localhost', 'ganache']
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const frontEndAbiFile = '../fairraffle-front/abi/raffle_manager.json'
const frontEndContractsFile = '../fairraffle-front/abi/contract_addresses.json'
module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  frontEndContractsFile,
  frontEndAbiFile,
}
