# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Use case
The application is a system for passengers to get refunded if a flight is delayed due to airline responsiblity.
It is a decentralized application (dApp) built on Ethereum with Solidity, with a React frontend. The business logic is fully enforced by the smart contracts and does not require trust between involved parties.
## Architecture
The dApp is implemented with 2 smart contracts:
- a **Data** smart contract, that stores all the data of the application, such as Airline, Flight and Passenger information and Passenger balances, but no business logic.
- an **App** smart contract, that implements all the business logic

This architecture makes the dApp fully **upgradable**, meaning that if the business logic changes (or if corrections need to be made), we can create a new App contract with the new business logic. To ensure security, the contract owner - and only him - declares the adresses of the App Smart Contract that is authorized to ask datas to the Data smart contract.
The frontend is built with React, that interacts with the Ethereum blockchain with web3.js library.

## Users
It has 4 user types that can interact with the dApp:
- **Contract Owner**, that has administration rights over the smart contracts:
-- can pause and reactivate the App Contract
-- can authorize or forbid the App Contract to access the Data contract
- **Airlines**, that can register new airlines, fund the contract, and publish flights:
--is required to fund the contract before using the following features:
-- register a new airline. If less than 5 airlines are registered and have funded the contract, an airline can register directly another airline. If more airlines are registered, then the new airlines needs to be approved by at least 50% of the participating airlines.
-- register a Flight, by indicating it's itinerary and scheduled arrival time
- **Passengers**, that can buy insurance and get refunded if the flight is delayed:
-- buy insurance for a flight
-- request the flight status (ontime, delayed due to airline responsiblity, delayed for other reasons) to Oracles. See Oracles below. 
-- if Flight is delayed due to airline responsibility, the Passenger can claim the refund, that will be credited to his account in the Smart COntract.
-- decide at any time to send the earned credits to its personal wallet.
- **Oracles**, that provides flight status to the Passenger:
The Oracles are third party actors that first register to the smart contract, and provides a stake to ensure they will act responsibly. The Oracles listen to the blockchain for events (request for flight status) and send their answer to the smart contract. The smart contracts waits to get enough confirmations from different Oracles (for instance, 3 confirmations from different Oracles). Once this happens, the smart contract emits an event to notify the Passengers.
For this project we are not interacting with real Oracles, and we are simulating 20 Oracles with a Node.js server.

## Security
The following patterns and practices are implemented:
- Fail fast: test if conditions for calling a method are fulfilled as early as possible
- Debit before Credit
- SafeGuard in the payment methods to EOAs (Externally Owned Account), to detect recursion in a payment call (further protection against re-entrancy)
- Pausable contract
- Upgradable contract, with separation of Data and App Contract.
- For the pay function (enabling passengers to send fund to their personal wallet: test if a call is made by a Smart Contract or an EOA, and enables owlly calls from EOAs.


## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), a dApp (using React) and a server app.

Make sure you run Node.js v14.0.0

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the front-end dapp:

cd dapp
npm start

To view dapp:

`http://localhost:3006`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder

## Test scenario
For quick testing, some accounts have been pre-configured, please follow the following steps:
1. Run Ganache on port 7545, and generate a wallet with 20 accounts minimum, with this mnemonic:
"candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
2. Account 0 is configured as Contract Owner, Account 1 to 5 are configured as Airlines, and accounts 6 to 10 are configured as Passengers.
3. Connect as the Contract Owner with account 0. You need to authorize the App contract in the Data Contract
4. Connect as the first airline with account 1. Account is pre registered, but you need to fund the contract to participate. You can then either: register a new airline, or register some flights. After 4 airlines have been registered and have paid their funding, register a new airline require 50% consensus (e.g. 2 votes in case of registering a 5th airline)
5. Connect as a passenger using accounts 6 to 10. You can pay for an insurance, then request Oracles to porvide flight status. if flight was delayed due to airline responsibility, you can credit 1.5 times the amount you paid. You can then trnasfer credit to passenger's personal wallet. For quick testing, each even request to Oracles (request 2, 4, 6...) will generate a flight delayed due to airline responsibility.


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)