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
import { Button, Message } from 'semantic-ui-react';
import Layout from './Components/layout';


//function
const App = () => {

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [operational, setOperational] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("")
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [message, setMessage] = useState({header: "", content: "", display:false})


  

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
    setLoadingMeta(true)
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
      setLoadingMeta(false)
    })
  }

  

  const isOperational = async () => {
    let result = await contract.flightSuretyApp.methods.isOperational().call({from: contract.airlines[0]})
    return result
  }

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
      setMessage({...message, display: false})
      // if (res.length > 1) {
      //   alert("Please have only one account connected!")
      //   contract.metamaskAccountID = null
      // }
      //console.log("contract after account changed: ", contract);
    });
  })


  return (
    <div className="App">
      <Layout
        contract={contract}
        account={connectedAccount}
        >
      {!connectedAccount &&
        <div className='metamask'>
        <Button 
          loading={loadingMeta}
          primary
          onClick={() => connectMetamask()}
          size="massive"
          >
          Connect Metamask
        </Button>
        </div>}
      
            {(userType === "Owner") && <ContractOwner
              account={connectedAccount}
              contract={contract}
              operational={operational}
            ></ContractOwner>}

            {userType === "Airline" && <Airline
              setMessage={setMessage}
              contract={contract}
              account={connectedAccount}
            ></Airline>}
            {userType === "Passenger" && <Passenger></Passenger>}

            {message.display && <Message
                header={message.header}
                content={message.content}
            >
            </Message>}
      </Layout>

     
    </div>
  );
}

export default App;
