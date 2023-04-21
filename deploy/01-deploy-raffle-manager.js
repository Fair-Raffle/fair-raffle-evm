const { network, ethers } = require('hardhat')
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')

const FUND_AMOUNT = ethers.utils.parseEther('1') // 1 Ether, or 1e18 (10^18) Wei

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  console.log('Deploying RaffleManager...')

  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock
  if (chainId === 1337) {
    vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock')
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait()
    subscriptionId = transactionReceipt.events[0].args.subId
    // Fund the subscription
    // Our mock makes it so we don't actually have to worry about sending fund
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]['vrfCoordinatorV2']
    subscriptionId = networkConfig[chainId]['subscriptionId']
  }
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  log('----------------------------------------------------')

  const perlinNoise = await deploy('PerlinNoise', {
    from: deployer,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })

  const arguments = [
    subscriptionId,
    vrfCoordinatorV2Address,
    networkConfig[chainId]['gasLane'],
  ]

  console.log('Arguments', arguments)

  const raffle = await deploy('RaffleManager', {
    from: deployer,
    args: arguments,
    libraries: {
      PerlinNoise: perlinNoise.address,
    },
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      'VRFCoordinatorV2Mock'
    )
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Verifying...')
    await verify(raffle.address, arguments)
  }
}

module.exports.tags = ['all', 'rafflemanager']
