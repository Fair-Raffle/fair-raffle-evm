// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';
import './PerlinNoise.sol';
import 'hardhat/console.sol';

contract RaffleManager is VRFConsumerBaseV2, ConfirmedOwner {
  error Error_RaffleFinished(uint raffleId);
  error Error_RaffleNotFulfilled(uint raffleId);
  error Error_RaffleAlreadyRequested(uint raffleId);
  error Error_InvalidValue(uint value);
  error Error_NotFound(uint id);
  error Error_NotOwner(uint id);

  event CollectionCreated(
    uint indexed collectionId,
    string name,
    string symbol
  );

  event RaffleCreated(
    uint indexed raffleId,
    string ipfsHash,
    uint collectionId,
    uint32 numberOfTickets,
    uint32 numberOfWinners
  );

  event RequestSent(uint requestId, uint32 numWords);
  event RequestFulfilled(uint requestId, uint[] randomWords);
  event WinnersSelected(uint raffleId, uint winnerAmount);

  enum RaffleStatus {
    CREATED,
    VRF_REQUESTED,
    FULFILLED,
    FINISHED
  }

  struct Raffle {
    address owner;
    RaffleStatus status;
    RequestStatus requestStatus;
    string name;
    uint id;
    string raffleListIpfsHash;
    uint32 numberOfTickets;
    uint32 numberOfWinners;
    uint collectionId;
    string raffleResultIpfsHash;
    uint time;
  }

  struct Collection {
    address owner;
    uint id;
    string name;
    string symbol;
    string image;
    string externalUrl;
    string twitterUrl;
    string discordUrl;
    uint supplyLimit;
    uint raffleCount;
  }

  struct RequestStatus {
    uint requestId;
    bool fulfilled; // whether the request has been successfully fulfilled
    bool exists; // whether a requestId exists
    uint[] randomWords;
  }

  mapping(uint => Collection) public collections;
  mapping(uint => Raffle) public raffles;
  mapping(uint => mapping(uint => bool)) public resultsOfRaffle;
  mapping(uint => mapping(uint => uint)) public realRaffleIdsOfCollection;
  mapping(uint => uint) public rafflesByRequestId;

  uint public lastRaffleId = 0;
  uint public lastCollectionId = 0;

  VRFCoordinatorV2Interface public immutable COORDINATOR;
  bytes32 public immutable s_keyHash;
  uint64 public immutable s_subscriptionId;
  uint16 requestConfirmations = 3;
  uint32 constant CALLBACK_GAS_LIMIT = 100000;

  constructor(
    uint64 subscriptionId,
    address vrfCoordinator,
    bytes32 keyHash
  ) VRFConsumerBaseV2(vrfCoordinator) ConfirmedOwner(msg.sender) {
    ConfirmedOwner(msg.sender);
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    s_keyHash = keyHash;
    s_subscriptionId = subscriptionId;
  }

  function fulfillRandomWords(
    uint _requestId,
    uint[] memory _randomWords
  ) internal override {
    // if (_requestId < 0 || _requestId > lastRaffleId) {
    //   revert Error_NotFound(_requestId);
    // }

    uint raffleId = rafflesByRequestId[_requestId];
    Raffle storage raffle = raffles[raffleId];
    raffle.requestStatus.randomWords = _randomWords;
    raffle.requestStatus.fulfilled = true;
    raffle.status = RaffleStatus.FULFILLED;

    emit RequestFulfilled(_requestId, _randomWords);
  }

  function createCollection(
    string memory name,
    string memory symbol,
    string memory image,
    string memory externalUrl,
    string memory twitterUrl,
    string memory discordUrl,
    uint supplyLimit
  ) public onlyOwner returns (uint) {
    lastCollectionId++;
    uint collectionId = lastCollectionId;
    collections[collectionId] = Collection(
      msg.sender,
      collectionId,
      name,
      symbol,
      image,
      externalUrl,
      twitterUrl,
      discordUrl,
      supplyLimit,
      0
    );

    emit CollectionCreated(collectionId, name, symbol);
    return collectionId;
  }

  function createRaffle(
    string memory name,
    string memory raffleListIpfsHash,
    uint collectionId,
    uint32 numberOfTickets,
    uint32 numberOfWinners
  ) public onlyOwner returns (uint) {
    if (collectionId <= 0 || collectionId > lastCollectionId) {
      revert Error_NotFound(collectionId);
    }
    if (numberOfTickets == 0) {
      revert Error_InvalidValue(numberOfTickets);
    }
    if (numberOfWinners == 0) {
      revert Error_InvalidValue(numberOfWinners);
    }
    if (numberOfWinners > numberOfTickets) {
      revert Error_InvalidValue(numberOfWinners);
    }

    Collection storage collection = collections[collectionId];

    if (collection.owner != msg.sender) {
      revert Error_NotOwner(collectionId);
    }

    lastRaffleId++;
    collection.raffleCount++;

    uint raffleId = lastRaffleId;

    realRaffleIdsOfCollection[collectionId][collection.raffleCount] = raffleId;
    raffles[raffleId] = Raffle(
      msg.sender,
      RaffleStatus.CREATED,
      RequestStatus(0, false, false, new uint[](0)),
      name,
      raffleId,
      raffleListIpfsHash,
      numberOfTickets,
      numberOfWinners,
      collectionId,
      '',
      0
    );

    emit RaffleCreated(
      raffleId,
      raffleListIpfsHash,
      collectionId,
      numberOfTickets,
      numberOfWinners
    );

    return raffleId;
  }

  function selectRandomValues(uint raffleId) public onlyOwner {
    Raffle storage raffle = raffles[raffleId];
    if (raffle.owner != msg.sender) {
      revert Error_NotOwner(raffleId);
    }
    if (raffle.status == RaffleStatus.FINISHED) {
      revert Error_RaffleFinished(raffleId);
    }
    if (raffle.requestStatus.exists) {
      revert Error_RaffleAlreadyRequested(raffleId);
    }

    uint requestId = COORDINATOR.requestRandomWords(
      s_keyHash,
      s_subscriptionId,
      requestConfirmations,
      CALLBACK_GAS_LIMIT,
      2
    );

    raffle.requestStatus.randomWords = new uint[](0);
    raffle.requestStatus.exists = true;
    raffle.requestStatus.fulfilled = false;
    raffle.requestStatus.requestId = requestId;
    raffle.status = RaffleStatus.VRF_REQUESTED;
    rafflesByRequestId[requestId] = raffleId;

    emit RequestSent(requestId, 2);
  }

  function selectWinners(uint raffleId) public onlyOwner {
    Raffle storage raffle = raffles[raffleId];
    if (raffle.owner != msg.sender) {
      revert Error_NotOwner(raffleId);
    }
    if (raffle.status == RaffleStatus.FINISHED) {
      revert Error_RaffleFinished(raffleId);
    }
    if (!raffle.requestStatus.fulfilled) {
      revert Error_RaffleNotFulfilled(raffleId);
    }
    uint[] memory randomNumbers = raffle.requestStatus.randomWords;
    uint firstIndex = randomNumbers[0] % raffle.numberOfTickets;
    uint gap = randomNumbers[1] % raffle.numberOfTickets;
    uint skip = 0;
    uint lastWinnerIndex = 0;

    for (uint i = 0; i < raffle.numberOfWinners; i++) {
      int x = int(
        (i * firstIndex + skip + lastWinnerIndex + firstIndex) % 65536
      );
      int y = int((i * gap + skip * lastWinnerIndex + gap) % 65536);
      uint selectedIndex = uint(PerlinNoise.noise2d(x, y)) %
        (raffle.numberOfTickets);

      if (resultsOfRaffle[raffleId][selectedIndex]) {
        i--;
        skip = skip + 1;
        continue;
      }

      lastWinnerIndex = selectedIndex;
      resultsOfRaffle[raffleId][selectedIndex] = true;
    }

    raffle.status = RaffleStatus.FINISHED;
    raffle.time = block.timestamp;
    raffle.requestStatus.fulfilled = true;

    emit WinnersSelected(raffleId, raffle.numberOfWinners);
  }

  //VIEWS

  function getRaffleOfCollection(
    uint collectionId,
    uint raffleIndex
  ) public view returns (Raffle memory) {
    if (collectionId <= 0 || collectionId > lastCollectionId) {
      revert Error_NotFound(collectionId);
    }
    if (
      raffleIndex <= 0 || raffleIndex > collections[collectionId].raffleCount
    ) {
      revert Error_NotFound(raffleIndex);
    }

    uint raffleId = realRaffleIdsOfCollection[collectionId][raffleIndex];
    return raffles[raffleId];
  }

  function getWinnersOfRaffle(
    uint raffleId
  ) public view returns (uint[] memory) {
    if (raffleId < 0 || raffleId > lastRaffleId) {
      revert Error_NotFound(raffleId);
    }

    Raffle memory raffle = raffles[raffleId];
    uint[] memory winners = new uint[](raffle.numberOfWinners);
    uint winnerIndex = 0;
    for (uint i = 0; i < raffle.numberOfTickets; i++) {
      if (resultsOfRaffle[raffleId][i]) {
        winners[winnerIndex] = i;
        winnerIndex++;
      }
    }
    return winners;
  }

  function isWinner(uint raffleId, uint ticketId) public view returns (bool) {
    if (raffleId < 0 || raffleId > lastRaffleId) {
      revert Error_NotFound(raffleId);
    }
    if (ticketId < 0 || ticketId > raffles[raffleId].numberOfTickets) {
      revert Error_NotFound(ticketId);
    }

    return resultsOfRaffle[raffleId][ticketId];
  }
}
