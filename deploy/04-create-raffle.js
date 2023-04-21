const { network, ethers } = require('hardhat')

const randomWords = [
  'elytrashamrock',
  'herassured',
  'sneakensign',
  'interpretunique',
  'hatshort',
  'nohitterfallacious',
  'governrapid',
  'developinggamy',
  'itemshipwreck',
  'wiryportrait',
  'abundantnormally',
  'swarmglistering',
  'escapemull',
  'insectdrunk',
  'theoryboom',
  'clotheunbalanced',
  'visorexpel',
  'slurpspin',
  'aidewombat',
  'passengerlawyer',
  'absurdcoveralls',
  'mortgagecoffle',
  'worstbitesized',
  'investshannon',
  'scrapemercurial',
  'governormellohi',
  'stomachkindle',
  'agitatedevening',
  'cockroachvolatile',
  'eraoffense',
  'golfingdanger',
  'alivesect',
  'widebirch',
  'bannerunion',
  'ruddykhakis',
  'vibrantuntie',
  'backingpractice',
  'slightant',
  'yeahdig',
  'insistentrod',
  'pollsailor',
  'pestharm',
  'breatheoats',
  'inflateherd',
  'searchdispatcher',
  'trickynow',
  'lethargicshotput',
  'voleashamed',
  'whackboyfriend',
  'mizzenmastplatform',
  'ignorantbean',
  'coyotetomatoes',
  'lifejackethave',
  'mensteam',
  'luffstable',
  'overcoatbitter',
  'dingalingsneering',
  'combinethen',
  'quarteringgarment',
  'caftanwire',
  'poinsettiaedit',
  'mongoosemeinie',
  'markeddowdy',
  'currenttelephone',
  'flangelucky',
  'fairunkindness',
  'respirationshawl',
  'tactfulhoneycomb',
  'ensignquartz',
  'phonybuyer',
  'lotsclamour',
  'lostmoorhen',
  'enchantingnight',
  'brassieretutu',
  'pearsamount',
  'breechesmuscle',
  'flatbreadderanged',
  'storecrimson',
  'alwayscontrast',
  'enemyshoot',
  'colgatebricks',
  'forefingersharpness',
  'unbreakingwham',
  'ringoccur',
  'stylishpine',
  'lamentbillion',
  'didevaluate',
  'bloodsomehow',
  'gatherstand',
  'ethicalthin',
  'llamainfluence',
  'heritagehabitat',
  'dupemourning',
  'attentivejackrabbit',
  'honkslate',
  'everyonesled',
  'properfetch',
  'bibdebonair',
  'cideroysters',
  'nautiluschalk',
  'dairyallude',
  'candlelightbobcat',
  'nutsdiscrete',
  'oatmealdowntown',
  'gunpowderbowline',
  'wheatsuffer',
  'tagaward',
  'cistuscoral',
  'proposecrystals',
  'enormousalliance',
  'ratlinefolk',
  'obviouslycomparison',
  'grabdupe',
  'shadesson',
  'impatientimmodest',
  'pollutioncovert',
  'additionallimes',
  'sheeptawdry',
  'chemisemess',
  'scudticket',
  'glibofficer',
  'thameswheat',
  'planksvelvety',
  'carrotcinnamon',
  'hoodiepalate',
  'sledderprompt',
  'electronicluff',
  'standingjam',
  'clipclopsimplistic',
  'favorally',
  'gravelleopard',
  'familysavanna',
  'cyancornea',
  'howeverfootprints',
  'loinclothgrounded',
  'foldsurprising',
  'lymphforemast',
  'surprisedtaper',
  'emailstronghold',
  'frostedtoffee',
  'pitchossified',
  'whileburied',
  'tailedobnoxious',
  'bewitchedflapjack',
  'periodsloth',
  'samediaphragm',
  'gambrave',
  'rewardingnotice',
  'sundressillegal',
  'guardsmanbeef',
  'tirelutz',
  'rhumbasolution',
  'artisticwash',
  'loverpuzzling',
  'mergedistressed',
  'commercialgreatest',
  'recommendchervil',
  'cackleappraiser',
  'uniformher',
  'expertlot',
  'briefsethnic',
  'creakrule',
  'gorillawindsurfer',
  'angeliccravat',
  'honeytext',
  'cluckfew',
  'violentnegligible',
  'linnetturkey',
  'curddisc',
  'smokedcouch',
  'transparentbirthday',
  'profilebelted',
  'defendaustere',
  'concernedverifiable',
  'defenseeconomics',
  'guidancereason',
  'panoramicoptimistic',
  'agencychimpanzee',
  'bureaucratlion',
  'chemisttomorrow',
  'accomplishsownder',
  'pursechough',
  'aidcurriculum',
  'cranberrieshelm',
  'lugcalamitous',
  'evergreenimp',
  'irasciblebizarre',
  'stringpillock',
  'especiallyarse',
  'speakervalid',
  'instantgrouchy',
  'tabernacleeyeglasses',
  'absoluteirascible',
  'bongsambar',
  'sharkfaith',
  'killimage',
  'newspaperfeathered',
  'successfulold',
  'wellmadeflight',
  'whitingikea',
]

const generateIPFS = () => {
  let ipfs = 'Qm'
  for (let i = 0; i < 44; i++) {
    ipfs += Math.floor(Math.random() * 10)
  }
  return ipfs
}

const createRaffle = async (raffleManager, i) => {
  const name = randomWords[Math.floor(Math.random() * randomWords.length)]
  const ipfs = 'QmQjLudAH6sSQDTkq7WSm76oDQeX62iXgMzPxTsNongnsr'
  const numberOfTickets = 1515 // Math.floor(Math.random() * 10) + 10
  const numberOfWinners = 444 // Math.floor(Math.random() * 2 + 1)
  await raffleManager.createRaffle(
    name,
    ipfs,
    i + 1,
    numberOfTickets,
    numberOfWinners
  )
}

module.exports = async () => {
  const raffleManager = await ethers.getContract('RaffleManager')
  const collectionCount = await raffleManager.lastCollectionId()

  // for (let i = 0; i < collectionCount; i++) {
  //   for (let j = 0; j < Math.floor(Math.random() * 1 + 1); j++) {
  //     await createRaffle(raffleManager, j)
  //   }
  // }

  await createRaffle(raffleManager, 0)

  console.log('Raffle created!')
}

module.exports.tags = ['all', 'raffle']
