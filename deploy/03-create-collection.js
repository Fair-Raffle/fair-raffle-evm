const { network, ethers } = require('hardhat')
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require('../helper-hardhat-config')

const collections = [
  {
    name: 'Lucky Cookies',
    symbol: 'LC',
    image: 'https://luckyc00kies.com/webp/welcome.webp',
    externalUrl: 'https://luckyc00kies.com',
    twitterUrl: 'https://twitter.com/luckyc00kies',
    discordUrl: 'https://discord.gg/XMBrMZck',
    supplyLimit: 1515,
  },
  // {
  //   name: 'Early Starkers',
  //   symbol: 'ES',
  //   image:
  //     'https://mintsquare.sfo3.cdn.digitaloceanspaces.com/mintsquare/collections/earlystarkers.jpeg',
  //   externalUrl: 'https://www.earlystarkers.io/',
  //   supplyLimit: 1234,
  // },
]

module.exports = async ({ getNamedAccounts, deployments }) => {
  for (const collection of collections) {
    const raffleManager = await ethers.getContract('RaffleManager')
    console.log(`Creating collection ${collection.name}...`)
    await raffleManager.createCollection(
      collection.name,
      collection.symbol,
      collection.image,
      collection.externalUrl,
      collection.twitterUrl,
      collection.discordUrl,
      collection.supplyLimit
    )
  }

  console.log('Collections created!')
}

module.exports.tags = ['all', 'collection']
