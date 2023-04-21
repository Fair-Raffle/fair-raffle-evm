const hre = require('hardhat')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

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

const collections = [
  {
    name: 'Lucky Cookies',
    symbol: 'LC',
  },
  {
    name: 'Early Cookies',
    symbol: 'EC',
  },
  {
    name: 'Lucky Starker',
    symbol: 'LS',
  },
  {
    name: 'Lucky Guardians',
    symbol: 'LG',
  },
  {
    name: 'Stark Guardians',
    symbol: 'SG',
  },
  {
    name: 'Early Starker',
    symbol: 'ES',
  },
]

const createCollection = async (name, symbol) => {
  const tx = await raffleManager.createCollection(name, symbol)
  await tx.wait()
  console.log(`Created collection ${name} with symbol ${symbol}`)
}

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
  console.log(`Created raffle ${name} with collectionId ${collectionId}`)
}

const selectRandomValues = async (raffleId) => {
  const tx = await raffleManager.selectRandomValues(raffleId)
  await tx.wait()
  console.log(`Selected random values for raffle ${raffleId}`)
}

const fulfill = async (raffleId) => {
  const _raffle = await raffleManager.raffles(raffleId)
  const tx = await vrfCoordinatorV2Mock.fulfillRandomWords(
    _raffle.requestStatus.requestId,
    raffleManager.address
  )

  await tx.wait()
  console.log(`Raffle ${_raffle.id} is fulfilled`)
}

const selectWinner = async (raffleId) => {
  const tx = await raffleManager.selectWinners(raffleId)
  await tx.wait()
  console.log(`Selected winners for raffle ${raffleId}`)
}

async function main() {
  for (const collection of collections) {
    await createCollection(collection.name, collection.symbol)
  }

  for (let i = 0; i < collections.length; i++) {
    await createRaffle(`Lucky Cookie Raffle ${i + 1}`, i + 1, 500, 50)
  }

  for (let i = 0; i < collections.length; i++) {
    await selectRandomValues(i + 1)
  }

  for (let i = 0; i < collections.length; i++) {
    await fulfill(i + 1)
  }

  for (let i = 0; i < collections.length; i++) {
    await selectWinner(i + 1)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
