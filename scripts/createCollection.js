const hre = require('hardhat')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

async function main() {
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

  for (const collection of collections) {
    const tx = await raffleManager.createCollection(
      collection.name,
      collection.symbol
    )
    await tx.wait()
  }

  const collectionCount = await raffleManager.lastCollectionId()
  console.log(`Collection Count: ${collectionCount}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
