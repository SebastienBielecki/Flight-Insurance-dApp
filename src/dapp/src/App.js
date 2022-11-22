import './App.css';
import "./flightsurety.css";
import contract from './contract';
import { useEffect, useState } from 'react';
import ContractOwner from './Components/contract-owner';
import Airline from './Components/airline';
import Passenger from './Components/passengers';
import { Button, Message } from 'semantic-ui-react';
import Layout from './Components/layout';
import { useGlobalContext } from './context';
import { typeAccount } from './helpers';


//function
const App = () => {

  const { 
    loaders,
    setLoaders, 
    message, 
    setMessage, 
    currentUser, 
    setCurrentUser,
    setOperational,
    setAppContractAuthorized,
    flights,
    setFlights,
    operational,
    appContractAuthorized,
    setFetching
  } = useGlobalContext()

  console.log("Render from App.js");

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false)
  const [loadingMeta, setLoadingMeta] = useState(false)
  
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
      setCurrentUser({account: res[0], profile: typeAccount(res[0])})
      //console.log("contract after Metamask: ", contract);
      setIsMetamaskConnected(true)
      setLoadingMeta(false)
    })
  }

  const isAppContractAuthorized = async () => {
    let result = await contract.flightSuretyData.methods.isAppContractAuthorized(contract.flightSuretyApp._address).call({from: currentUser.account})
    return result
}

  const isOperational = async () => {
    let result = await contract.flightSuretyApp.methods.isOperational().call({from: contract.airlines[0]})
    return result
  }

  

  const fetchFlights = async () => {
    setFetching(true)
    let result = await contract.flightSuretyApp.methods.getFlightsArray().call({from: currentUser.account})
    let flightsTemp = []
    for (let element of result ) {
      let temp = await contract.flightSuretyApp.methods.getFlight(element).call({from: currentUser.account})
      //console.log("Fetch FLight result: ",)
      let flight = {
        key: temp[0],
        airline: temp[1],
        itinerary: temp[2],
        time: temp[3],
        statusCode: temp[4]
      }
      flightsTemp.push(flight)
    }
    setFlights(flightsTemp)
    setFetching(false)
  }

  // make the message disappear after 10 seconds
  useEffect (() => {
    if (message.display) {
      setTimeout(() => setMessage({display: false}), 10000)
    }
  }, [message])



  // set blockcahin events listeners
  useEffect(() => {
    let dataListener = contract.flightSuretyData.events.Authorized((error, result) => {
      console.log("authorized event from DATA SC");
      if (error) {
        console.log(error);
      } else {
        setMessage({
          display: true,
          header: "Data contract authorized App contract was changed",
          content: `App contract ${result.returnValues.appAddress} authorization is set to ${result.returnValues.auth}`
        })
        
        setAppContractAuthorized(result.returnValues.auth)
      }
    })
  
    let appListener = contract.flightSuretyApp.events.allEvents((error, result) => {
      console.log("Allevents event from app.js");
      if (error) {
        console.log(error);
        setMessage({
          display: true,
          header: "Error",
          content: error
        })
        setLoaders({})
      } else {
        switch(result.event) {
          case "Operational": 
            console.log("Operational event received", result.event);
            setMessage({
              positive: true,
              display: true,
              header: `Operational mode set to ${result.returnValues.mode}`
            })
            setOperational(result.returnValues.mode)
            setLoaders({})
            break
          case "RegisteredAirline":
              console.log("RegisteredAirline event", result.event)
              if (result.returnValues[0]) {
                setMessage({
                    positive: true,
                    display: true,
                    header: "Succesfully registered",
                    content: `${result.returnValues[1]} votes out of ${result.returnValues[2]}`
                })
              } else {
                setMessage({
                    positive: true,
                    display: true,
                    header: "Thank you for your vote",
                    content: `${result.returnValues[1]} vote(s) out of ${result.returnValues[2]}`
                })
              }
              setLoaders({})
              break
          case "Funded":
            console.log("Funded event")
            setMessage({
              positive: true,
              display: true,
              header: "Funds successfully transfered",
              content: "You can now register flights and vote for new airlines to participate"
            })
            setLoaders({})
            break
          case "AirlineRegistered":
            console.log("AirlineRegistered event");
            if (result.returnValues[0]) {
              setMessage({
                  positive: true,
                  display: true,
                  header: "Succesfully registered",
                  content: `${result.returnValues[1]} votes out of ${result.returnValues[2]}`
              })
            } else {
              setMessage({
                  positive: true,
                  display: true,
                  header: "Thank you for your vote",
                  content: `${result.returnValues[1]} vote(s) out of ${result.returnValues[2]}`
              })
            }
            setLoaders({})
            break
          case "FlightRegistered":
            console.log("FlightRegistered event")
            let {key, airline, itinerary, time} = result.returnValues
            setMessage({
                positive: true,
                header: "Flight succesfully registered",
                content: `Airline ${airline} \nFlight: ${itinerary} \nTime: ${time}`,
                display: true
            })
            fetchFlights()
            setLoaders({})
            break
          case "InsuranceBought":
            console.log("InsuranceBought event");
            let {flightKey, buyer, amount} = result.returnValues
            amount = contract.web3.utils.fromWei(amount, "ether")
            console.log(`flightKey ${flightKey} bought from ${buyer} for ${amount} Ethers`)
            setMessage({
              positive: true,
              header: "Insurance succesfully bought",
              content: `Insurance bought from ${buyer} for ${amount} Ethers`,
              display: true
            })
            setLoaders({})
            break
          case "OracleRequest":
            console.log("OracleRequestEvent")
            console.log(`Index ${result.returnValues[0]} Airline ${result.returnValues[1]} Itinerary ${result.returnValues[2]} Time ${result.returnValues[3]}`);
            break
            //emit OracleReport(airline, flight, timestamp, statusCode);
          case "OracleReport":
            console.log("***** ORACLE REPORT EVENT **** ")
            console.log(result.returnValues);
            fetchFlights()
            break
          default:
            console.log("An event was received, but was not handled: ", result);
            setMessage({
              warning: true,
              display: true,
              header: "Unknow event received",
              content: {result}
            })
            setLoaders({})
        }
      }
    });
    return () => {
      dataListener = null
      appListener = null
    }
  }, [])

  useEffect(() => {
    const fetchInitialStatus = async () => {
      let op = await isOperational()
      let authorized = await isAppContractAuthorized()
      console.log("contract authorized: ", authorized);
      setOperational(op)
      setAppContractAuthorized(authorized)
    }
    console.log("useEffect [] app.js, fetch contract status")
    setFetching(true)
    fetchInitialStatus()
    fetchFlights()
    setFetching(false)

  }, [])

    
  

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
      setCurrentUser({account: res[0], profile: typeAccount(res[0])})
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
      <Layout>
      {!currentUser.account &&
        <div className='metamask'>
        <Button 
          loading={loadingMeta}
          className="metamask-btn"
          
          color="orange"
          onClick={() => connectMetamask()}
          size="massive"
          >
          Login with Metamask
        </Button>
        </div>}
            {(currentUser.profile === "Owner") && <ContractOwner/>}
            {currentUser.profile === "Airline" && appContractAuthorized && operational && <Airline/>}
            {currentUser.profile === "Passenger" && appContractAuthorized && operational &&<Passenger/>}
            {(currentUser.profile !== "Owner" && (!appContractAuthorized || !operational)) &&<Message
              icon='thumbs down outline'
              header='The service is not active'
              content={`${operational ? "": "Contract is not operational."} ${appContractAuthorized ? "": "App contract is not authorized by Data Contract."}`}
            />}
            {message.display && <Message
                positive={message.positive}
                negative={message.negative}
                warning={message.warning}
                header={message.header}
                content={message.content}
            >
            </Message>}
      </Layout>
    </div>
  );
}

export default App;
