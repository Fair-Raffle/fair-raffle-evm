const { assert, expect } = require('chai')
const { ethers } = require('hardhat')
const fs = require('fs')
describe('Raffle', function () {
  let RaffleManager, raffleManager, player, vrfCoordinatorV2Mock

  const KEY_HASH =
    '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c'
  const VRF_COORDINATOR = '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625'

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

  beforeEach(async () => {
    accounts = await ethers.getSigners()
    //   deployer = accounts[0]
    player = accounts[1]
    const PerlinNoise = await ethers.getContractFactory('PerlinNoise')
    const perlinNoise = await PerlinNoise.deploy()
    await perlinNoise.deployed()

    RaffleManager = await ethers.getContractFactory('RaffleManager', {
      libraries: {
        PerlinNoise: perlinNoise.address,
      },
    })
    const VrfCoordinatorV2Mock = await ethers.getContractFactory(
      'VRFCoordinatorV2Mock'
    )

    vrfCoordinatorV2Mock = await VrfCoordinatorV2Mock.deploy(0, 0)
    vrfCoordinatorV2Mock.connect(player)

    await vrfCoordinatorV2Mock.createSubscription()

    console.log('vrfCoordinatorV2Mock', vrfCoordinatorV2Mock.address)
    raffleManager = await RaffleManager.deploy(
      1,
      vrfCoordinatorV2Mock.address,
      KEY_HASH
    )

    await raffleManager.deployed()
    raffleManager.connect(player)
    const tx = await raffleManager.createCollection(
      'Lucky Cookies',
      'LC',
      'https://luckyc00kies.com/webp/welcome.webp',
      'https://luckyc00kies.com/',
      1515
    )
    await tx.wait()

    const tx2 = await vrfCoordinatorV2Mock.addConsumer(1, raffleManager.address)
    await tx2.wait()

    ethers.provider.send('evm_mine', [])
  })

  describe('raffle', () => {
    it('finish raffle', async () => {
      const winnerCount = 400
      await createRaffle('First Raffle', 1, 1515, winnerCount)

      let _raffle = await raffleManager.getRaffleOfCollection(1, 1)

      const tx2 = await raffleManager.selectRandomValues(_raffle.id)
      await tx2.wait(1)

      _raffle = await raffleManager.getRaffleOfCollection(1, 1)

      expect(_raffle.status).to.equal(1)

      await new Promise(async (resolve) => {
        raffleManager.on('RequestFulfilled', async (raffleId) => {
          _raffle = await raffleManager.getRaffleOfCollection(1, 1)
          expect(_raffle.status).to.equal(2)
          console.log('RequestFulfilled', raffleId)
          resolve()
        })

        await vrfCoordinatorV2Mock.fulfillRandomWords(1, raffleManager.address)
      })

      const tx3 = await raffleManager.selectWinners(_raffle.id)
      await tx3.wait(1)

      _raffle = await raffleManager.getRaffleOfCollection(1, 1)
      expect(_raffle.status).to.equal(3)

      const winners = await raffleManager.getWinnersOfRaffle(_raffle.id)
      expect(winners.length).to.equal(winnerCount)
      console.log('random numbers: ', _raffle.requestStatus.randomWords)
      for (let i = 0; i < winners.length; i++) {
        console.log(
          // 'diff: ',
          parseInt(winners[i]._hex, 16) //- parseInt(winners[i - 1]._hex, 16)
        )
      }
      fs.appendFileSync(
        'randomNumbers.txt',
        winners.map((w) => parseInt(w._hex, 16)).join(', ') + '\n'
      )
    })
  })
})
