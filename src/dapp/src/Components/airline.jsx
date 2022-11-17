import { useEffect, useState } from 'react';
import contract from '../contract';
import "./airline.css"
import { Grid, GridColumn, Button, Input, Form, Divider } from 'semantic-ui-react';
import FlightTable from './flightCard';

const Airline = (props) => {
    console.log("Render Airlines");
    const [airlineInfo, setAirlineinfo] = useState({name: "", registered: false, funded: false})
    const [address, setAddress] = useState("")
    
    
    const generateStatusCode = () => {
        // for simulation purpose flight will be delayed by company's fault 50% of times
        let result = Math.random()
        if (result < 0.5) return 20
        else if (result > 0.9) return 0
        else if (result > 0.8) return 10
        else if (result > 0.7) return 30
        else if (result > 0.6) return 40
        else return 50
    }

    const [flight, setFlight] = useState({airline: "", itinerary: "", time: "", code: generateStatusCode()})
    const handleChange = (e) => {
        setAddress(prev => e.target.value)
    }

    const handleFlightChange = (e) => {
        const {name, value } = e.target
        setFlight(prev => {
            return {
            ...prev, 
            [name]: value,
            airline: props.account
        }
        })
    }

    const handleSubmitFlight = async () => {
        //let code = generateStatusCode()
        props.setLoaders({regFlight: true})
        let number = await contract.flightSuretyApp.methods.getFlightnumber().call({from: props.account})
        setFlight(prev => {
            return {
                ...prev,
                number
            }
        })
        await contract.flightSuretyApp.methods.registerFlight(flight.airline, flight.time, flight.code, flight.itinerary).send({from: props.account})
        //console.log(flight);
        //props.setFlights(prev => [...prev, flight])
        setFlight({code: generateStatusCode(), itinerary: "", time: ""})
    }

    const submitAirline = async (add) => {
        props.setLoaders({regAirline: true})
        let result = await contract.flightSuretyApp.methods.registerAirline(add, "Airline").send({from: props.account})
        console.log(result);
        setAddress("")
    }

    const fund = async() => {
        props.setLoaders({...props.loaders, fund: true})
        await props.contract.flightSuretyApp.methods.fund().send({from: props.account, value: props.contract.web3.utils.toWei('1', 'ether')})
        getAirlineInfo()
    }

    const getAirlineInfo = async () => {
        let result = await props.contract.flightSuretyApp.methods.getAirlineInfo(props.account).call()
        //console.log(result);
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
                        <Button loading={props.loaders.fund} onClick={() => fund()} primary>Fund 1 Ethers</Button>
                    </div>}
                    {(airlineInfo.registered && airlineInfo.funded) && <div className='register'>
                        <h2>Register or Vote for new Airline</h2>
                        <Input focus onChange={handleChange} placeholder="new airline address" value={address}></Input>
                        <Button loading={props.loaders.regAirline} onClick={() => submitAirline(address)} primary floated="right">Register / Vote</Button>
                    </div>}
                </GridColumn>
            </Grid.Row>
            <Divider inverted></Divider>
            {airlineInfo.funded && <Grid.Row>
                <Grid.Column width={5}>
                    <h2>Register Flights</h2>
                    <Form inverted onSubmit={handleSubmitFlight}>
                        <Form.Field>
                            <label>Itinerary</label>
                            <input onChange={handleFlightChange} placeholder="Itinerary" name="itinerary" value={flight.itinerary}/>
                        </Form.Field>
                        <Form.Field>
                            <label>Arrival Time</label>
                            <input  onChange={handleFlightChange} placeholder="HH:MM" name="time" value={flight.time}/>
                        </Form.Field>
                        <Form.Button loading={props.loaders.regFlight} floated="right" type="submit">Submit</Form.Button>
                    </Form>
                </Grid.Column>
                <Grid.Column width = {11}>
                    <h2>Flights</h2>
                    <FlightTable
                        props={props.contract}
                        flights={props.flights}
                    ></FlightTable>
                    <Button onClick={props.getFlightsArray} primary>Get Flight Array</Button>
                </Grid.Column>
            </Grid.Row>}
        </Grid>
    </>)
}

export default Airline