const {
  frontEndContractsFile,
  frontEndAbiFile,
} = require('../helper-hardhat-config')
const fs = require('fs')
const { network } = require('hardhat')

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Writing to front end...')
    await updateContractAddresses()
    await updateAbi()
    console.log('Front end written!')
  }
}

async function updateAbi() {
  const raffle = await ethers.getContract('RaffleManager')
  fs.writeFileSync(
    frontEndAbiFile,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  )
}

async function updateContractAddresses() {
  const raffle = await ethers.getContract('RaffleManager')
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, 'utf8')
  )
  const chainId = network.config.chainId.toString()
  if (chainId in contractAddresses) {
    contractAddresses[chainId] = [raffle.address]
  } else {
    contractAddresses[chainId] = [raffle.address]
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ['all', 'frontend']
