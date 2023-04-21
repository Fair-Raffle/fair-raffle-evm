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
  const tx = await raffleManager.selectRandomValues(7)
  await tx.wait()

  // const raffleAmount = await raffleManager.lastRaffleId()
  // for (let i = 0; i < raffleAmount; i += 1) {
  //   const _raffle = await raffleManager.raffles(i + 1)
  //   if (_raffle.status !== 0) {
  //     continue
  //   }
  //   const tx = await raffleManager.selectRandomValues(_raffle.id)
  //   await tx.wait()

  //   console.log(`Raffle ${_raffle.id} started`)
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
