import { useEffect, useState } from "react";
import "./contract-owner.css"
import { Grid, Button, GridColumn, Divider, Menu, GridRow } from "semantic-ui-react";

const ContractOwner = (props) => {

    console.log("Render Contract Owner");

    const [loadingAuth, setLoadingAuth] = useState(false)
    const [loadingPause, setLoadingPause] = useState(false)
    const [balance, setBalance] = useState()

    const toggleOperationalStatus = async () => {
        props.setLoaders({...props.loaders, operational: true})
        await props.contract.flightSuretyApp.methods.toggleOperationalStatus().send({from: props.account});
    }
    
    const toggleAuthorization = async (mode) => {
        setLoadingAuth(true)
        await props.contract.flightSuretyData.methods.toggleAppContractAuthorization(props.contract.flightSuretyApp._address).send({from: props.account})
        setLoadingAuth(false)
    }

    const getContractBalance = async () => {
        let balance = await props.contract.web3.eth.getBalance(props.contract.flightSuretyData._address)
        balance = props.contract.web3.utils.fromWei(balance, "ether")
        setBalance(balance)
    }

    const init = async () => {
        await getContractBalance()
    }  

    init()
    // useEffect(() => isAppContractAuthorized, [authorized, props.account])

    
    

    return (<>
        <div className="admin-container">
            <Grid>
                <Grid.Column width={8}>
                    <h2>App Contract:</h2> 
                    <p className="address">{props.contract.flightSuretyApp._address}</p>
                    <Divider></Divider>
                    <div className="row">
                        <p>{props.operational ? "Contract is Operational" : "Contract is not operational"}</p>
                        <Button 
                            onClick={() => toggleOperationalStatus()} 
                            primary
                            loading={props.loaders.operational}
                            floated="right"
                            >
                            {props.operational ? "Pause Contract" : "Activate contract"}
                        </Button>
                    </div>
                    <div className="row">
                        <p>{!props.appContractAuthorized ? "APP CONTRACT NOT AUTHORIZED BY DATA CONTRACT" : "App contract authorized by data contract"}</p>
                        <Button 
                            onClick={() => toggleAuthorization()} 
                            primary
                            loading={props.loaders.authorized}
                            floated="right"
                            >
                            {!props.appContractAuthorized ? "Authorize" : "Deauthorize"}
                        </Button>
                    </div>
                </Grid.Column>
                <Divider vertical></Divider>
                <GridColumn width={8}>
                    <h2>Data Contract:</h2>
                    <p className="address">{props.contract.flightSuretyData._address}</p>
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
