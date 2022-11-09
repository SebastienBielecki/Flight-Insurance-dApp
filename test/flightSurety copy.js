
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const FUNDING_FEE = web3.utils.toWei('10', "ether");
const INSUFFICIENT_FUNDING_FEE = web3.utils.toWei('5', "ether");

contract('Flight Surety Data Contract Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });
  
  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

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

  
  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

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

  /*

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });
  */

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, "Airline 2", {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.getAirlineInfo.call(newAirline); 

    // ASSERT
    assert.equal(result[2], false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('airline is not enabled if if funds less than 10 ethers', async () => {
    
    // ARRANGE
    //let newAirline = accounts[2];
    let airline1 = accounts[1];
    try {
        await config.flightSuretyData.fund({from: airline1, value: INSUFFICIENT_FUNDING_FEE});
    } catch (error) {
        
    }
    
    
    // ACT

    let result = await config.flightSuretyData.getAirlineInfo(airline1);
    assert.equal(result[3], false, "airline funded less than 10 ethers, but was enabled");
    

  });

  it('airline can fund 10 ethers and get enabled', async () => {
    
    // ARRANGE
    //let newAirline = accounts[2];
    let airline1 = accounts[1];
    await config.flightSuretyData.fund({from: airline1, value: FUNDING_FEE});
    
    // ACT

    let result = await config.flightSuretyData.getAirlineInfo(airline1);
    //console.log(result);
    assert.equal(result[3], true, "airline funded 10 ethers, but was not enabled");
    

  });

  it('5th airline requires at 50% of approvals', async () => {
    
    // ARRANGE
    //let newAirline = accounts[2];
    let airline1 = accounts[1];
    for (let i = 2; i<=4; i++) {
        await config.flightSuretyData.registerAirline(accounts[i], `Airline ${i}`, {from: airline1})
        await config.flightSuretyData.fund({from: accounts[i], value: FUNDING_FEE});
        let result = await config.flightSuretyData.getAirlineInfo(accounts[i]);
        assert.equal(result[2], true, `airline ${i} was not registed`);
        assert.equal(result[3], true, `airline ${i} funded 10 ethers, but was not enabled`);
        
    }

    //let voteCount = await config.flightSuretyData.getVotesCount(accounts[5]);
    //console.log("votes for airline 5 before", voteCount);

    await config.flightSuretyData.registerAirline(accounts[5], `Airline ${5}`, {from: airline1})
    
    //let registeredTotal = await config.flightSuretyData.registeredAirlinesTotal.call();
    //let foundersTotal = await config.flightSuretyData.haveFundedAirlinesTotal.call();
    let result = await config.flightSuretyData.getAirlineInfo(accounts[5]);
    //voteCount = await config.flightSuretyData.getVotesCount(accounts[5]);
    // console.log("votes for airline 5 after", voteCount);
    // console.log("total registered", registeredTotal);
    // console.log("total funded", foundersTotal);
    // console.log(result);
    assert.equal(result[2], false, `airline was registed, although 50% was not achieved`);
    await config.flightSuretyData.registerAirline(accounts[5], `Airline ${5}`, {from: accounts[2]})
    result = await config.flightSuretyData.getAirlineInfo(accounts[5]);
    assert.equal(result[2], true, `airline was not registed, although 50% was achieved`);
  });

//   it('(airline) can register an Airline using registerAirline() if it is funded', async () => {
    
//     // ARRANGE
//     let newAirline = accounts[2];
//     await config.flightSuretyData.fund(web3.utils.toWei('10', 'ether'), {from: accounts[1]});

//     // ACT
//     try {
//         await config.flightSuretyData.registerAirline(newAirline, "Airline 2", {from: config.firstAirline});
//     }
//     catch(e) {

//     }
//     let result = await config.flightSuretyData.getAirlineInfo.call(newAirline); 

//     // ASSERT
//     assert.equal(result[2], false, "Airline should not be able to register another airline if it hasn't provided funding");

//   });

it('can test Fligh Surety App', async () => {
    
  // ARRANGE
  //let newAirline = accounts[2];
  let result = await config.flightSuretyApp.contractOwner.call()
  console.log(result);
 
  

});

// it('can register an airline from Fligh Surety App', async () => {
    
//   // ARRANGE
//   //let newAirline = accounts[2];
//   for (let i = 1; i<4; i++) {
//     console.log(`airline: ${i}`);
//     await config.flightSuretyApp.registerAirline(accounts[6], `Airline ${6}`, {from: accounts[i]})
//     console.log(`end of airline: ${i}`);
//   }
//   let result = await config.flightSuretyData.getAirlineInfo(accounts[6]);
//   assert.equal(result[2], true, `airline was not registed, although 50% was achieved`);
  
 
  

// });

it('app address can be retrieved', async () => {
    
  let appAddress = await config.flightSuretyApp.address;
  console.log(appAddress);
  
 
  

});


 
  

});
