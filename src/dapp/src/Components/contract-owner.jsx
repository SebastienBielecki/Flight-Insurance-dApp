import "./contract-owner.css"

const ContractOwner = (props) => {

    const setOperationalStatus = async (mode) => {
        await props.contract.flightSuretyApp.methods.setOperatingStatus(mode).send({from: props.account});
      }

    return (<>
        <button onClick={() => setOperationalStatus(!props.operational)} className="btn btn-primary pause-contract">{props.operational ? "Pause Contract" : "Active contract"}</button>
    </>)
}

export default ContractOwner
