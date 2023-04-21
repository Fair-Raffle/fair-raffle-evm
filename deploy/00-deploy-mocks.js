const { network } = require('hardhat')

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  console.log('chainId', chainId)
  // If we are on a local development network, we need to deploy mocks!
  if (chainId === 1337) {
    log('Local network detected! Deploying mocks...')
    await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      log: true,
      args: [0, 0],
    })

    log('Mocks Deployed!')
    log('----------------------------------------------------------')
  }
}
module.exports.tags = ['all', 'mocks']
