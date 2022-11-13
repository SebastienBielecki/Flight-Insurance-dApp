import { useEffect, useState } from 'react';
import contract from '../contract';
import "./airline.css"

const Airline = (props) => {

    const [airlineInfo, setAirlineinfo] = useState({name: "", registered: false, funded: false})
    const [address, setAddress] = useState("")

    const handleChange = (e) => {
        console.log(e.target.value);
        setAddress(prev => e.target.value)
    }

    const submitAirline = async (add) => {
        await contract.flightSuretyApp.methods.registerAirline(add, "Airline").send({from: props.account})
        setAddress("")
    }

    let events = contract.flightSuretyApp.events.Funded((error, result) => {
        if (error) {
          console.log(error);
        } else {
          getAirlineInfo()
        }
      });

    const registerAirline = async (address, name) => {
        await props.contract.flightSuretyApp.methods.registerAirline(address, name)
    }

    const fund = async() => {
        await props.contract.flightSuretyApp.methods.fund().send({from: props.account, value: props.contract.web3.utils.toWei('1', 'ether')})
    }

    const getAirlineInfo = async () => {
        let result = await props.contract.flightSuretyApp.methods.getAirlineInfo(props.account).call()
        console.log(result);
        setAirlineinfo({
            name: result[1],
            registered: result[2],
            funded: result[3]
        })
    }

    useEffect(() => {getAirlineInfo()}, [props.account])

    return (<>
        <div className="airline-info">
            <h2>My info</h2>
            <p>{airlineInfo.name}</p>
            <p>Registered: {airlineInfo.registered ? "Yes" : "No"}</p>
            <p>Have Funded: {airlineInfo.funded ? "Yes" : "No"}</p>
        </div>
        {!airlineInfo.registered && <h2 className="wait-registered">Wait for being registered</h2>}
        {(airlineInfo.registered && !airlineInfo.funded) && <div className="fund">
            <p>You have not participated to the insurance fund.</p>
            <button onClick={() => fund()} className="btn btn-primary">Fund 1 Ethers</button>
        </div>}
        {(airlineInfo.registered && airlineInfo.funded) && <div className='register'>
            <h2>Register or Vote for new Airline</h2>
            <input onChange={handleChange}placeholder="new airline address" value={address}></input>
            <button onClick={() => submitAirline(address)}className='btn btn-primary'>Register / Vote</button>
        </div>}
    </>)
}

export default Airline