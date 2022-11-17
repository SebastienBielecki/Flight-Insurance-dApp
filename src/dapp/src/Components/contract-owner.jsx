import { useEffect, useState } from "react";
import "./contract-owner.css"
import contract from '../contract';
import { Grid, Button, GridColumn, Divider, Menu, GridRow } from "semantic-ui-react";
import { useGlobalContext } from "../context";

const ContractOwner = () => {

    const { 
        loaders, 
        setLoaders,  
        handleError, 
        currentUser ,
        operational,
        setOperational,
        appContractAuthorized, 
        setAppContractAuthorized
    } = useGlobalContext()

    console.log("Render Contract Owner");

    const [balance, setBalance] = useState()

    const toggleOperationalStatus = async () => {
        setLoaders({...loaders, operational: true})
        try {
            await contract.flightSuretyApp.methods.toggleOperationalStatus().send({from: currentUser.account});
        } catch (error) {
            handleError(error)
        }
        

    }
    
    const toggleAuthorization = async (mode) => {
        setLoaders({...loaders, authorized: true})
        try {
            await contract.flightSuretyData.methods.toggleAppContractAuthorization(contract.flightSuretyApp._address).send({from: currentUser.account})
        } catch (error) {
            handleError(error)
        }
        
    }

    const getContractBalance = async () => {
        let balance = await contract.web3.eth.getBalance(contract.flightSuretyData._address)
        balance = contract.web3.utils.fromWei(balance, "ether")
        setBalance(balance)
    }

    const init = async () => {
        await getContractBalance()
    }  

    init()

    return (<>
        <div className="admin-container">
            <Grid>
                <Grid.Column width={8}>
                    <h2>App Contract:</h2> 
                    <p className="address">{contract.flightSuretyApp._address}</p>
                    <Divider></Divider>
                    <div className="row">
                        <p>{operational ? "Contract is Operational" : "Contract is not operational"}</p>
                        <Button 
                            onClick={() => toggleOperationalStatus()} 
                            primary
                            loading={loaders.operational}
                            floated="right"
                            >
                            {operational ? "Pause Contract" : "Activate contract"}
                        </Button>
                    </div>
                    <div className="row">
                        <p>{!appContractAuthorized ? "APP CONTRACT NOT AUTHORIZED BY DATA CONTRACT" : "App contract authorized by data contract"}</p>
                        <Button 
                            onClick={() => toggleAuthorization()} 
                            primary
                            loading={loaders.authorized}
                            floated="right"
                            >
                            {!appContractAuthorized ? "Authorize" : "Deauthorize"}
                        </Button>
                    </div>
                </Grid.Column>
                <Divider vertical></Divider>
                <GridColumn width={8}>
                    <h2>Data Contract:</h2>
                    <p className="address">{contract.flightSuretyData._address}</p>
                    <Divider></Divider>
                    <div className="row">
                        <p>Funds in Contract: {(Math.round(balance * 100) / 100).toFixed(2)} Ethers</p>
                    </div>
                </GridColumn>
            </Grid>
        </div>
    </>)
}

export default ContractOwner
