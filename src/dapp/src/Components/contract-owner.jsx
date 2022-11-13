import { useEffect, useState } from "react";
import "./contract-owner.css"

const ContractOwner = (props) => {

    const [authorized, setAuthorized] = useState(false)

    const setOperationalStatus = async (mode) => {
        await props.contract.flightSuretyApp.methods.setOperatingStatus(mode).send({from: props.account});
      }
    
    const isAppContractAuthorized = async () => {
        let result = await props.contract.flightSuretyData.methods.isAppContractAuthorized(props.contract.flightSuretyApp._address).call({from: props.account})
        setAuthorized(result)
    }

    const toggleAuthorization = async (mode) => {
        await props.contract.flightSuretyData.methods.toggleAppContractAuthorization(props.contract.flightSuretyApp._address).send({from: props.account})
        isAppContractAuthorized()
    }

    useEffect(() => isAppContractAuthorized, [])

    
    

    return (<>
        <div className="admin-container">
            <button onClick={() => setOperationalStatus(!props.operational)} className="btn btn-primary pause-contract">{props.operational ? "Pause Contract" : "Active contract"}</button>
            <h2>App Smart Contract address:</h2> 
            <p>{props.contract.flightSuretyApp._address}</p>
            <h3>{!authorized ? "THIS APP CONTRACT IS NOT AUTHORIZED BY THE DATA CONTRACT" : "This app contract is authorized by the data contract!"}</h3>
            <button onClick={() => toggleAuthorization()} className="btn btn-primary">{!authorized ? "Authorize Contract" : "Deauthorize Contract"}</button>
        </div>
    </>)
}

export default ContractOwner
