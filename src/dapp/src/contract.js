import FlightSuretyApp from './build/contracts/FlightSuretyApp.json';
import FlightSuretyData from './build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';



class Contract {
    constructor(network) {
        
        let config = Config[network];
        this.web3 = new Web3(window.ethereum)
        //this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        
        // this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.initialize(network);
        
    }

    async initialize(network) {
        
        console.log("reinit script running");
        this.owner = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
        this.airlines.push("0xf17f52151EbEF6C7334FAD080c5704D77216b732")
        this.airlines.push("0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef")
        this.airlines.push("0x821aEa9a577a9b44299B9c15c88cf3087F3b5544")
        this.airlines.push("0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2")
        this.airlines.push("0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e")
        this.passengers.push("0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5")
        this.passengers.push("0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5")
        this.passengers.push("0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc")
        this.passengers.push("0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE")
        this.passengers.push("0xE44c4cf797505AF1527B11e4F4c6f95531b4Be24")


        // this.web3.eth.getAccounts((error, accts) => {
        //     this.owner = accts[0];
        //     let counter = 1;
        //     while(this.airlines.length < 5) {
        //         this.airlines.push(accts[counter++]);
        //     }
        //     while(this.passengers.length < 5) {
        //         this.passengers.push(accts[counter++]);
        //     }
        // const authorizeApp = async () => {
        //     console.log("auth begins");
        //     await contract.flightSuretyData.methods.authorizeAppContract(Config[network].appAddress).send({from: accts[0]});
        //     console.log("auth ended");
        // }
        //     authorizeApp()
            //this.web3 = new Web3(window.ethereum)
            // callback();
        // });

    }
}



const contract = new Contract('localhost')
    




export default contract

