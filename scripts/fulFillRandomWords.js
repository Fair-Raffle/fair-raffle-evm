const hre = require('hardhat')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

async function main() {
  const raw = fs.readFileSync(
    './artifacts/contracts/RaffleManager.sol/RaffleManager.json'
  )
  const raw_2 = fs.readFileSync(
    './artifacts/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json'
  )
  const data_raffle = JSON.parse(raw)
  const data_vrf = JSON.parse(raw_2)
  const privateKey = process.env.PRIVATE_KEY
  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider)
  const raffleManager = new hre.ethers.Contract(
    process.env.RAFFLE_MANAGER,
    data_raffle.abi,
    wallet
  )

  const vrfCoordinatorV2Mock = new hre.ethers.Contract(
    process.env.VRF_MOCK,
    data_vrf.abi,
    wallet
  )

  const raffleAmount = await raffleManager.lastRaffleId()
  for (let i = 0; i < raffleAmount; i += 1) {
    const _raffle = await raffleManager.raffles(i + 1)
    if (_raffle.status !== 1) {
      continue
    }
    const tx = await vrfCoordinatorV2Mock.fulfillRandomWords(
      _raffle.requestStatus.requestId,
      raffleManager.address
    )

    await tx.wait()

    console.log(`Raffle ${_raffle.id} sent fulfill request`)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
