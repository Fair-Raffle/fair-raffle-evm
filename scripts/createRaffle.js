const hre = require('hardhat')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

async function main() {
  const raw = fs.readFileSync(
    './artifacts/contracts/RaffleManager.sol/RaffleManager.json'
  )
  const data = JSON.parse(raw)
  const privateKey = process.env.PRIVATE_KEY
  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider)
  const raffleManager = new hre.ethers.Contract(
    process.env.RAFFLE_MANAGER,
    data.abi,
    wallet
  )

  const collectionCount = await raffleManager.lastCollectionId()

  const createRaffle = async (
    name,
    collectionId,
    numberOfTickets,
    numberOfWinners
  ) => {
    const tx = await raffleManager.createRaffle(
      name,
      'QmdoEKSJeucXjNpEYapuUviquaQ1ECWpy52RRbitqkqLiG',
      collectionId,
      numberOfTickets,
      numberOfWinners
    )
    await tx.wait()
  }

  for (let i = 0; i < collectionCount; i++) {
    await createRaffle(`Lucky Cookie Raffle ${i + 1}`, i + 1, 100, 10)
  }

  console.log(`Done`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
