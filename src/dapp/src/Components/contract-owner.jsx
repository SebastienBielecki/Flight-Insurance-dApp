import { useEffect, useState } from "react";
import "./contract-owner.css"
import { Grid, Button, GridColumn, Divider, Menu, GridRow } from "semantic-ui-react";

const ContractOwner = (props) => {

    const [authorized, setAuthorized] = useState(false)
    const [loadingAuth, setLoadingAuth] = useState(false)
    const [loadingPause, setLoadingPause] = useState(false)

    const setOperationalStatus = async (mode) => {
        setLoadingPause(true)
        await props.contract.flightSuretyApp.methods.setOperatingStatus(mode).send({from: props.account});
        setLoadingPause(false)
    }
    
    const isAppContractAuthorized = async () => {
        let result = await props.contract.flightSuretyData.methods.isAppContractAuthorized(props.contract.flightSuretyApp._address).call({from: props.account})
        setAuthorized(result)
    }

    const toggleAuthorization = async (mode) => {
        setLoadingAuth(true)
        await props.contract.flightSuretyData.methods.toggleAppContractAuthorization(props.contract.flightSuretyApp._address).send({from: props.account})
        await isAppContractAuthorized()
        setLoadingAuth(false)
    }

    const init = async () => {
        await isAppContractAuthorized()
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
                            onClick={() => setOperationalStatus(!props.operational)} 
                            primary
                            loading={loadingPause}
                            floated="right"
                            >
                            {props.operational ? "Pause Contract" : "Active contract"}
                        </Button>
                    </div>
                    <div className="row">
                        <p>{!authorized ? "APP CONTRACT NOT AUTHORIZED BY DATA CONTRACT" : "App contract authorized by data contract"}</p>
                        <Button 
                            onClick={() => toggleAuthorization()} 
                            primary
                            loading={loadingAuth}
                            floated="right"
                            >
                            {!authorized ? "Authorize" : "Deauthorize"}
                        </Button>
                    </div>
                </Grid.Column>
                <Divider vertical></Divider>
                <GridColumn width={8}>
                    <h2>Data Contract:</h2>
                </GridColumn>
            </Grid>
        </div>
    </>)
}

export default ContractOwner
