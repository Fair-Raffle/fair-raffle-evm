const { network, ethers } = require('hardhat')
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require('../helper-hardhat-config')

const selectRandomValues = async (vrf, requestId, address) => {
  const tx = await vrf.fulfillRandomWords(requestId, address)
  await tx.wait(1)
}

module.exports = async () => {
  const chainId = network.config.chainId

  if (chainId === 1337) {
    const raffleManager = await ethers.getContract('RaffleManager')
    const vrf = await ethers.getContract('VRFCoordinatorV2Mock')
    const raffleCount = await raffleManager.lastRaffleId()

    for (let i = 0; i < raffleCount; i++) {
      const raffleId = i + 1
      const raffle = await raffleManager.raffles(raffleId)

      if (raffle.status === 1 && Math.random() > 0.5) {
        await selectRandomValues(
          vrf,
          raffle.requestStatus.requestId,
          raffleManager.address
        )
      }
    }

    console.log('Fulfilled random words!')
  }
}

module.exports.tags = ['all', 'request']
