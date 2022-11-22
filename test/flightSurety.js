
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const FUNDING_FEE = web3.utils.toWei('1', "ether");
const REASONABLE_FEE = web3.utils.toWei('10', "finney");
const INSUFFICIENT_FUNDING_FEE = web3.utils.toWei('100', "finney");

contract('Flight Surety Data Contract Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    console.log("App address: ", config.flightSuretyApp.address);
    console.log("Data address: ", config.flightSuretyData.address);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`Data contract has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });
  
  it(`Data contract can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  
  it(`Data contract can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Contract Owner cannot change operational status");
      await config.flightSuretyData.setOperatingStatus(true);
  });

  it(`Data contract DOES NOT let access registerAirline when App contract IS NOT registered`, async function () {

    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try 
    {
        await config.flightSuretyApp.registerAirline(accounts[2], "airline 2", {from: accounts[1]});
    }
    catch(e) {
        accessDenied = true;
    }
    assert.equal(accessDenied, true, "Data contract has permitted access from unauthorized contract");
  });

  it(`Data contract DOES let access registerAirline when App contract IS registered`, async function () {

    // Ensure that access is allowed for Contract Owner account
    try {
      await config.flightSuretyData.toggleAppContractAuthorization(config.flightSuretyApp.address, {from: accounts[0]});
    } catch (error) {
      console.log(error);
    }
    let accessGranted = await config.flightSuretyApp.testAuthContractAccess.call({from: accounts[0]})
    assert.equal(accessGranted, true, "Data contract has not permitted access from authorized contract");
  });

  it(`A registered airline cannot fund if fund < min`, async function () {
    let result = await config.flightSuretyData.isAppContractAuthorized(config.flightSuretyApp.address);
    assert.equal(result, true, "App contract is not authorized");
    // Ensure that access is allowed for Contract Owner account
    let balanceDataContract1 = await web3.eth.getBalance(config.flightSuretyData.address);
    let balance1 = await web3.eth.getBalance(accounts[1]);
    //console.log("airline 1 balance before transaction", balance1);
    let reverted;
    try {
      await config.flightSuretyApp.fund({from: accounts[1], value: INSUFFICIENT_FUNDING_FEE});
      reverted = false;
    } catch (error) {
      reverted = true;
    }
    assert.equal(reverted, true, "transaction has not been reverted")
  });

  it(`A registered airline can fund if fund >= min`, async function () {
    let result = await config.flightSuretyData.isAppContractAuthorized(config.flightSuretyApp.address);
    assert.equal(result, true, "App contract is not authorized");
    // Ensure that access is allowed for Contract Owner account
    let balanceDataContract1 = await web3.eth.getBalance(config.flightSuretyData.address);
    let balance1 = await web3.eth.getBalance(accounts[1]);
    //console.log("airline 1 balance before transaction", balance1);
    await config.flightSuretyApp.fund({from: accounts[1], value: FUNDING_FEE});
    let balanceDataContract2 = await web3.eth.getBalance(config.flightSuretyData.address);
    let balance2 = await web3.eth.getBalance(accounts[1]);
    // check balance of airline 1 is consistent
    let delta = balance1 - balance2 - FUNDING_FEE
    let deltaOK = (delta < REASONABLE_FEE) ? true : false;
    assert.equal(deltaOK, true, "balance of airline 1 after and before transaction is inconsistent")
    assert.equal(balanceDataContract2 - balanceDataContract1, FUNDING_FEE, "balance of data contract after and before transaction is inconsistent")
    let balanceAppContract = await web3.eth.getBalance(config.flightSuretyApp.address);
    let airline1Info = await config.flightSuretyApp.getAirlineInfo.call(accounts[1]);
    assert.equal(airline1Info[3], true, "Adequate funding has been paid, but the airline is not active");
    let numberOfFundingPayees = await config.flightSuretyApp.getNumberOfFundingAirlines.call();
    assert.equal(numberOfFundingPayees, 1, "number of airlines who have correctly funded is not correct")
  });

  it(`Airline cannot register another if it has not paid initial contribution`, async function () {

    // register second airline
   
    await config.flightSuretyApp.registerAirline(accounts[2], "Airline 2", {from: accounts[1]})
    let airline2Info = await config.flightSuretyApp.getAirlineInfo.call(accounts[2]);
    assert.equal(airline2Info[2], true, "Airline 2 was not registered");
    let reverted;
    // try to make airline 2 (that has not paid initial contribution) register airline 3)
    try {
      await config.flightSuretyApp.registerAirline(accounts[3], "Airline 3", {from: accounts[2]})
      reverted = false;
    } catch (error) {
      reverted = true;
    }
    assert.equal(reverted, true, "airline 2 could register airline 3 without having fund")
});

it(`Airline that has funded can register alone a new airline, up to a total of 4`, async function () {

  // register second, third and fourth airline. Make them pay contribution
  await config.flightSuretyApp.fund({from: accounts[2], value: FUNDING_FEE});
  await config.flightSuretyApp.registerAirline(accounts[3], "Airline 3", {from: accounts[1]})
  await config.flightSuretyApp.fund({from: accounts[3], value: FUNDING_FEE});
  await config.flightSuretyApp.registerAirline(accounts[4], "Airline 4", {from: accounts[1]})
  await config.flightSuretyApp.fund({from: accounts[4], value: FUNDING_FEE});
  // Check that all airlines are registered and have funded
  for (let i = 2; i<5; i++) {
    airlineInfo = await config.flightSuretyApp.getAirlineInfo.call(accounts[i]);
    assert.equal(airlineInfo[2], true, `airline ${i} is not registered`)
    assert.equal(airlineInfo[3], true, `airline ${i} is not enabled`)
  }
});

it(`5th airline needs 50% consensus to get registered. Voters cannot vote multiple times`, async function () {

  // register 5th airline
  await config.flightSuretyApp.registerAirline(accounts[5], "Airline 5", {from: accounts[1]})
  airlineInfo = await config.flightSuretyApp.getAirlineInfo.call(accounts[5]);
  assert.equal(airlineInfo[2], false, `airline 5 is registered without consensus`)
  let votes = await config.flightSuretyApp.getVotesCount.call(accounts[5]);
  assert.equal(votes, 1, "1 vote should be registered")
  let reverted
  // check an airline cannot vote twice
  try {
    await config.flightSuretyApp.registerAirline(accounts[5], "Airline 5", {from: accounts[1]})
    reverted = false
  } catch (error) {
    reverted = true;
  }
  assert.equal(reverted, true, "airline 1 could vote 2 times")
  // make a second vote for 5ht airline. since it has 2 votes out of 4,
  // the 50% consensus is reached and the company should be registered.
  await config.flightSuretyApp.registerAirline(accounts[5], "Airline 5", {from: accounts[2]})
  votes = await config.flightSuretyApp.getVotesCount.call(accounts[5]);
  assert.equal(votes, 2, "2 votes should be registered")
  airlineInfo = await config.flightSuretyApp.getAirlineInfo.call(accounts[5]);
  assert.equal(airlineInfo[2], true, `airline 5 isn't registered, although consensus was reached`)
});

it(`Enabled airline can register a new flight`, async function () {

  let newFlight = {
    flight: "Mexico - Paris",
    airline: accounts[1],
    updatedTimestamp: 10,
    //updatedTimestamp: Math.floor(new Date('2012.08.10').getTime() / 1000),
    statusCode: 0
  }

  let key = await config.flightSuretyApp.getFlightKey(newFlight.airline, newFlight.flight, newFlight.updatedTimestamp);
  await config.flightSuretyApp.registerFlight(newFlight.airline, newFlight.flight, newFlight.updatedTimestamp, {from: accounts[1]});
  let result = await config.flightSuretyApp.getFlight.call(key);
  assert.equal(result[1], accounts[1], "registered flight has not the correct airline")
  assert.equal(result[2], "Mexico - Paris", "registered flight has not the correct itinerary")

});

});
