import FlightSuretyApp from '../dapp/src/build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
// let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
web3.eth.defaultAccount = web3.eth.accounts[0];
let accounts;



const FEE = web3.utils.toWei("1", "ether")

const ORACLES_COUNT = 1

//this counter will count the number of Oracle requests emited
let counter = 0;
// for simulation purpose the result of the requests will be the following
let statusFlight = [10, 20, 30, 20, 40, 20, 20, 10]

const registerOracle = async (i) => {
    try {
        let res = await flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: FEE, gas: "6000000" });
        //console.log("result of paying fee: ", res);
        let result = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[i]});
        console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
    } catch (error) {
        console.log("This is the error: ", error.message);
    }
}

const submitOracleResponse = async (oracle, index, airline, flight, timestamp, statusCode) => {
  try {
    await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({from: accounts[oracle], gas: "6000000"})
  } catch (error) {
    console.log(`Error sending Oracle number ${oracle} answer: `, error.message)
  }
}

//submitOracleResponse(uint8 index, address airline, string flight, uint256 timestamp, uint8 statusCode)



const init = async () => {
  accounts =  await web3.eth.getAccounts()
  for (let i = 0; i<ORACLES_COUNT; i++) {
    registerOracle(i)
  }
} 
//fdfd
init()


// event listener for OracleRequest event in the blockchain
flightSuretyApp.events.OracleRequest({fromBlock: 0}, function (error, event) {
    if (error) console.log(error.message)
    let {index , airline, flight, timestamp } = event.returnValues
    console.log(index, airline, flight, timestamp);
    for (let i = 0; i< ORACLES_COUNT; i++) {
      submitOracleResponse(i,index,airline, flight, timestamp, statusFlight[counter])
    }
  }
);

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


