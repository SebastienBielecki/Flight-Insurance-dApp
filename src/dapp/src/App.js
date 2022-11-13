import logo from './logo.svg';
import './App.css';
import "./flightsurety.css";
import contract from './contract';
import { useState } from 'react';
import Web3 from 'web3';
import Navbar from './Components/navbar';
import ContractOwner from './Components/contract-owner';
import Airline from './Components/airline';
import Passenger from './Components/passengers';


//function
const App = () => {

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [operational, setOperational] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("")

  

  const typeAccount = (account) => {
    if (account === contract.owner) {
       return "Owner"
    } 
    for (let i = 0; i < 5; i++) {
        if (account === contract.airlines[i]) {
            return "Airline"
        }
        if (account === contract.passengers[i]) {
            return `Passenger`
        }
    }
    return account
  }

  let userType = typeAccount(connectedAccount)
  
  
  const connectMetamask = async () => {
      //contract.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
    contract.web3.eth.getAccounts(function(err, res) {
      if (err) {
          console.log('Error:',err);
          return;
      }
      //console.log('getMetaskID:',res)
      contract.metamaskAccountID = res[0];
      setConnectedAccount(res[0])
        
      //console.log("contract after Metamask: ", contract);
      setIsMetamaskConnected(true)
    })
  }

  

  const isOperational = async () => {
    let result = await contract.flightSuretyApp.methods.isOperational().call({from: contract.airlines[0]})
    return result
  }

  // const setOperationalStatus = async (mode) => {
  //   await contract.flightSuretyApp.methods.setOperatingStatus(mode).send({from: connectedAccount[0]});
  // }

  // let events = contract.flightSuretyApp.events.allEvents((error, result) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     if (result.event="Operational")
  //     setOperational(result.returnValues["mode"])
  //   } if (result.event = "RegisterAirline") {
  //     console.log(result.returnValues["_address"]);
  //   }
  // });

  let events = contract.flightSuretyApp.events.Operational((error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Operational event received!", result);
      if (result.event="Operational")
      setOperational(result.returnValues["mode"])
    } if (result.event = "RegisterAirline") {
      console.log(result.returnValues["_address"]);
    }
  });
  
  const init = async () => {  
    let result = await isOperational()
    setOperational(result);
  }

  init()

  window.ethereum.on('accountsChanged', async () => {
    //console.log("Metamask account has changed");
    contract.web3.eth.getAccounts(function(err, res) {
      if (err) {
          console.log('Error: ',err);
          // setIsMetamaskConnected(false)
          // setConnectedAccount("")
      }
      //console.log('getMetaskID:',res);
      //let matchedAccount = matchAccount(res[0])
      setConnectedAccount(res[0])
      // if (res.length > 1) {
      //   alert("Please have only one account connected!")
      //   contract.metamaskAccountID = null
      // }
      //console.log("contract after account changed: ", contract);
    });
  })


  return (
    <div className="App">
      <Navbar
        account={connectedAccount}
        contract={contract}
        ></Navbar>
      {!connectedAccount && <button className="metamask btn btn-primary" onClick={() => connectMetamask()}>Connect Metamask</button>}
      

      <section className="container">
        
        {/* <div id="display-wrapper" className="top-20"></div> */}
        
        <div className="row top-20">
            <h1>{operational ? "Contract is operational" : "Contract is not operational"} </h1>
        </div>
        <div className="row top-20">
            {(userType === "Owner") && <ContractOwner
              account={connectedAccount}
              contract={contract}
              operational={operational}
            ></ContractOwner>}
            {userType === "Airline" && <Airline
              contract={contract}
              account={connectedAccount}
            ></Airline>}
            {userType === "Passenger" && <Passenger></Passenger>}

        </div>
      </section>

     
    </div>
  );
}

export default App;
