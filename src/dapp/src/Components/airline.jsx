import { useEffect, useState } from 'react';
import contract from '../contract';
import "./airline.css"
import { Grid, GridColumn, Button, Input, GridRow, Message } from 'semantic-ui-react';

const Airline = (props) => {

    const [airlineInfo, setAirlineinfo] = useState({name: "", registered: false, funded: false})
    const [address, setAddress] = useState("")
    

    const handleChange = (e) => {
        console.log(e.target.value);
        setAddress(prev => e.target.value)
    }

    const submitAirline = async (add) => {
        let result = await contract.flightSuretyApp.methods.registerAirline(add, "Airline").send({from: props.account})
        console.log(result);
        setAddress("")
    }

    let events = contract.flightSuretyApp.events.Funded((error, result) => {
        if (error) {
          console.log(error);
        } else {
          getAirlineInfo()
        }
    });
    
    let eventRegistered = contract.flightSuretyApp.events.RegisteredAirline((error, result) => {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
          if (result.returnValues[0]) {
            props.setMessage({
                display: true,
                header: "Succesfully registered",
                content: `${result.returnValues[1]} votes out of ${result.returnValues[2]}`
            })
          } else {
            props.setMessage({
                display: true,
                header: "Thank you for your vote",
                content: `${result.returnValues[1]} vote(s) out of ${result.returnValues[2]}`
            })
          }
        }
    });

    // const registerAirline = async (address, name) => {
    //     await props.contract.flightSuretyApp.methods.registerAirline(address, name)
    // }

    const fund = async() => {
        await props.contract.flightSuretyApp.methods.fund().send({from: props.account, value: props.contract.web3.utils.toWei('1', 'ether')})
        getAirlineInfo()
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
        <Grid>
            <Grid.Row>
            <Grid.Column width={5}>
                <h2>My info</h2>
                <p>{airlineInfo.name}</p>
                <p>Registered: {airlineInfo.registered ? "Yes" : "No"}</p>
                <p>Have Funded: {airlineInfo.funded ? "Yes" : "No"}</p>
                
            </Grid.Column>
            <GridColumn width={11}>
                {!airlineInfo.registered && <h2 className="wait-registered">Wait for being registered</h2>}
                {(airlineInfo.registered && !airlineInfo.funded) && <div className="fund">
                    <p>Fund to participate to the insurance program</p>
                    <Button onClick={() => fund()} primary>Fund 1 Ethers</Button>
                </div>}
        {(airlineInfo.registered && airlineInfo.funded) && <div className='register'>
            <h2>Register or Vote for new Airline</h2>
            <Input focus onChange={handleChange} placeholder="new airline address" value={address}></Input>
            <Button onClick={() => submitAirline(address)} primary floated="right">Register / Vote</Button>
        </div>}
        </GridColumn>
        </Grid.Row>
        </Grid>
    </>)
}

export default Airline