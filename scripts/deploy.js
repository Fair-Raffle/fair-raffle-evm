const hre = require('hardhat')
const KEY_HASH =
  '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c'

async function main() {
  const VrfCoordinatorV2Mock = await hre.ethers.getContractFactory(
    'VRFCoordinatorV2Mock'
  )
  const PerlinNoise = await ethers.getContractFactory('PerlinNoise')

  const perlinNoise = await PerlinNoise.deploy()
  await perlinNoise.deployed()
  const RaffleManager = await hre.ethers.getContractFactory('RaffleManager', {
    libraries: {
      PerlinNoise: perlinNoise.address,
    },
  })

  const vrfCoordinatorV2Mock = await VrfCoordinatorV2Mock.deploy(0, 0)
  await vrfCoordinatorV2Mock.deployed()
  await vrfCoordinatorV2Mock.createSubscription()

  const raffleManager = await RaffleManager.deploy(
    1,
    vrfCoordinatorV2Mock.address,
    KEY_HASH
  )

  await raffleManager.deployed()
  const tx2 = await vrfCoordinatorV2Mock.addConsumer(1, raffleManager.address)
  await tx2.wait()

  console.log(`RaffleManager deployed to: ${raffleManager.address}`)
  console.log(
    `VrfCoordinatorV2Mock deployed to: ${vrfCoordinatorV2Mock.address}`
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
