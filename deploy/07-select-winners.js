const { network, ethers } = require('hardhat')

const selectWinners = async (raffleManager, raffleId) => {
  const tx = await raffleManager.selectWinners(raffleId)
  await tx.wait()
}

module.exports = async () => {
  const raffleManager = await ethers.getContract('RaffleManager')
  const raffleCount = await raffleManager.lastRaffleId()

  for (let i = 0; i < raffleCount; i++) {
    const raffle = await raffleManager.raffles(i + 1)
    if (raffle.status === 2 && Math.random() > 0.5) {
      await selectWinners(raffleManager, i + 1)
    }
  }

  // await selectWinners(raffleManager, 7)

  console.log('Winners are selected!')
}

module.exports.tags = ['all', 'select']
