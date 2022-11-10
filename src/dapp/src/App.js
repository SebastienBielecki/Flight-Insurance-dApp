import logo from './logo.svg';
import './App.css';
import "./flightsurety.css";
import contract from './contract';

//function
const App = () => {

  
  console.log(contract);
  console.log(contract.flightSuretyApp.address);
  console.log("owner", contract.owner);
  

  let operational
  const init = async () => {


    const isOperational = async () => {
      let result = await contract.flightSuretyApp.methods.isOperational().call({from: contract.airlines[0]})
      return result
    }

    const getAirlineInfo = async () => {
      let result = await contract.flightSuretyApp.methods.getAirlineInfo("0xf17f52151EbEF6C7334FAD080c5704D77216b732").call()
      //let result = await contract.flightSuretyApp.methods.getAirlineInfo.call("0xf17f52151EbEF6C7334FAD080c5704D77216b732")
      //console.log("airline info: ", result);
      return result
    }

    const setOperationalStatus = async (mode) => {
      console.log("Owner: ", contract.owner);
      await contract.flightSuretyApp.methods.setOperatingStatus(mode).send({from: contract.owner});
    }

    let airlineInfo = await getAirlineInfo()
    console.log("airline info: ", airlineInfo);

    let operational = await isOperational()
    console.log("operational 1:", operational);
    await setOperationalStatus(false)
    operational = await isOperational()
    console.log("operational 2:", operational);
    await setOperationalStatus(true)
    operational = await isOperational()
    console.log("operational 3:", operational);

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
