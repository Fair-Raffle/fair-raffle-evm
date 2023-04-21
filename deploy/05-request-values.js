const { network, ethers } = require('hardhat')

const selectRandomValues = async (raffleManager, raffleId) => {
  const raffle = await raffleManager.raffles(raffleId)
  console.log('Raffle', raffleId, 'status', raffle.status)
  if (raffle.status !== 0) return

  const tx = await raffleManager.selectRandomValues(raffleId)
  await tx.wait()
}

module.exports = async () => {
  const raffleManager = await ethers.getContract('RaffleManager')
  const raffleCount = await raffleManager.lastRaffleId()

  console.log('Request values!')
  console.log('Raffle count:', raffleCount.toNumber())
  for (let i = 0; i < raffleCount; i++) {
    // if (Math.random() > 0.5) {
    await selectRandomValues(raffleManager, i + 1)
    // }
  }

  // await selectRandomValues(raffleManager, 11)

  console.log('Request values!')
}

module.exports.tags = ['all', 'request']
