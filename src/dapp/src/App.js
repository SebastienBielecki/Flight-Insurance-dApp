import logo from './logo.svg';
import './App.css';
import "./flightsurety.css";
import contract from './contract';
import { useState } from 'react';
import Web3 from 'web3';

//function
const App = () => {

  // let events = contract.flightSuretyApp.events.allEvents();
  // console.log("Events: ", events);
  // events.watch((error, result) => {
  //   if (result.event === 'Operational') {
  //     console.log("Mode: ", result.args.mode);
  //     //console.log(`\n\nOracle Requested: index: ${result.args.index.toNumber()}, flight:  ${result.args.flight}, timestamp: ${result.args.timestamp.toNumber()}`);
  //   } else { 
  //     console.log(`incorrect event detected`);
  //   }
  // });

  // contract.flightSuretyApp.events.Operational((result) => {
  //   console.log("Event operational detected", result);

  // })

  contract.flightSuretyApp.events.Operational((err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  })

  const [operational, setOperational] = useState(false);
  
  console.log(contract.flightSuretyApp);
  
  const init = async () => {

    const initWeb3 = async () => {
      /// Find or Inject Web3 Provider
      /// Modern dapp browsers...
      if (window.ethereum) {
          App.web3Provider = window.ethereum;
          try {
              // Request account access
              await window.ethereum.enable();
          } catch (error) {
              // User denied account access...
              console.error("User denied account access")
          }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
          App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
          //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }

      // App.getMetaskAccountID();
    }

    const getMetaskAccountID = () => {
        let web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    }

    const isOperational = async () => {
      let result = await contract.flightSuretyApp.methods.isOperational().call({from: contract.airlines[0]})
      return result
    }

    const getAirlineInfo = async () => {
      let result = await contract.flightSuretyApp.methods.getAirlineInfo("0xf17f52151EbEF6C7334FAD080c5704D77216b732").call()
      return result
    }

    const setOperationalStatus = async (mode) => {
      await contract.flightSuretyApp.methods.setOperatingStatus(mode).send({from: contract.owner});
    }
    await initWeb3()
    getMetaskAccountID()
    await setOperationalStatus(true)


    // let airlineInfo = await getAirlineInfo()
    // console.log("airline info: ", airlineInfo);

    //setOperational(await isOperational())
    //console.log("operational 1:", operational);
    //await setOperationalStatus(true)
    //setOperational(await isOperational())
    // console.log("operational 2:", operational);
    // await setOperationalStatus(true)
    // operational = await isOperational()
    // console.log("operational 3:", operational);

    // const changeDummy = async () => {
    //   await contract.flightSuretyApp.methods.changeDummy(5).send({from: contract.owner});
    // }

    // const getDummy = async () => {
    //   let result = await contract.flightSuretyApp.methods.getDummy().call()
    //   return result
    // }

    // let dummy = await getDummy()
    // console.log("dummy 1: ", dummy);

    // await changeDummy()

    // dummy = await getDummy()
    // console.log("dummy 2: ", dummy);

  }

  init()

  

  // const getAirlineInfo = async () => {
  //   let result = await contract.flightSuretyApp.methods.getAirlineInfo("0xf17f52151EbEF6C7334FAD080c5704D77216b732").call()
  //   //let result = await contract.flightSuretyApp.methods.getAirlineInfo.call("0xf17f52151EbEF6C7334FAD080c5704D77216b732")
  //   console.log("airline info: ", result);
  // }
  // getAirlineInfo()




  

 

  // const setOperationalStatus = async (mode) => {
  //   console.log("Owner: ", contract.owner);
  //   await contract.flightSuretyApp.methods.setOperatingStatus(mode, {from: contract.owner});
  // }

  // setOperationalStatus(false)
  // operational = isOperational()

  return (
    <div className="App">
      <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
        <a className="navbar-brand" href="#">FlightSurety</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault"
            aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
      </nav>
      <section className="container">

        <div id="display-wrapper" className="top-20"></div>
        <div className="row top-20">
            <h1>{operational ? "operational" : "not operational"} </h1>
            <label className="form">Flight</label> 
            <input type="text" id="flight-number"></input>
            <button className="btn btn-primary" id="submit-oracle">Submit to Oracles</button>
        </div>
      </section>

     
    </div>
  );
}

export default App;
