import FlightSuretyApp from './build/contracts/FlightSuretyApp.json';
import FlightSuretyData from './build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';



class Contract {
    constructor(network) {
        
        let config = Config[network];
        console.log("from constructor, dataApp address: ", config.dataAddress);
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(network);
        // this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        
    }

    initialize(network) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            const authorizeApp = async () => {
                await contract.flightSuretyData.methods.authorizeAppContract(Config[network].appAddress).send({from: accts[0]});
            }
            
            authorizeApp()
            // callback();
        });

    }

    // isOperational(callback) {
    //    let self = this;
    //    self.flightSuretyApp.methods
    //         .isOperational()
    //         .call({ from: self.owner}, callback);
    // }

    // fetchFlightStatus(flight, callback) {
    //     let self = this;
    //     let payload = {
    //         airline: self.airlines[0],
    //         flight: flight,
    //         timestamp: Math.floor(Date.now() / 1000)
    //     } 
    //     self.flightSuretyApp.methods
    //         .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
    //         .send({ from: self.owner}, (error, result) => {
    //             callback(error, payload);
    //         });
    // }
}



const contract = new Contract('localhost')
    




export default contract

