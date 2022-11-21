import { useEffect, useState } from 'react';
import contract from '../contract';
import "./airline.css"
import { Grid, GridColumn, Button, Input, Form, Divider } from 'semantic-ui-react';
import FlightTable from './flightTable';
import { useGlobalContext } from '../context';
import { generateStatusCode } from '../helpers';

const Airline = (props) => {
    console.log("Render Airlines");
    const [airlineInfo, setAirlineinfo] = useState({name: "", registered: false, funded: false})
    const [address, setAddress] = useState("")
    const [flight, setFlight] = useState({airline: "", itinerary: "", time: ""})

    const { 
        loaders, 
        setLoaders, 
        handleError, 
        currentUser,
        setFetching
    } = useGlobalContext()
    
    const handleChange = (e) => {
        setAddress(prev => e.target.value)
    }

    const handleFlightChange = (e) => {
        const {name, value } = e.target
        setFlight(prev => {
            return {
            ...prev, 
            [name]: value,
            airline: currentUser.account
        }
        })
    }

    const handleSubmitFlight = async () => {
        let today = new Date()
        let time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), flight.time.substring(0,2), flight.time.substring(3))
        let timeUnix = Math.floor(time.getTime() / 1000)
        setLoaders({...loaders, regFlight: true})
        try {
            //generate a flight number
            // let number = await contract.flightSuretyApp.methods.getFlightnumber().call({from: currentUser.account})
            // setFlight(prev => {
            //     return {...prev, number}
            // })
            await contract.flightSuretyApp.methods.registerFlight(flight.airline, flight.itinerary, timeUnix).send({from: currentUser.account})
        } catch (error) {
            handleError(error)
        }
        // prepare status code for next flight
        setFlight({itinerary: "", time: ""})
    }

    const submitAirline = async (add) => {
        setLoaders({...loaders, regAirline: true})
        try {
            await contract.flightSuretyApp.methods.registerAirline(add, "Airline").send({from: currentUser.account})
        } catch (error) {
            handleError(error)
        }
        setAddress("")
    }

    const fund = async() => {
        setLoaders({...loaders, fund: true})
        try {
            await contract.flightSuretyApp.methods.fund().send({from: currentUser.account, value: contract.web3.utils.toWei('10', 'ether')})
            getAirlineInfo()
        } catch (error) {
            handleError(error)
        }
        
    }

    const getAirlineInfo = async () => {
        
        try {
            let result = await contract.flightSuretyApp.methods.getAirlineInfo(currentUser.account).call()
            setAirlineinfo({
                name: result[1],
                registered: result[2],
                funded: result[3]
            })
        } catch (error) {
            handleError(error)
        }
        
    }

    useEffect(() => {
        getAirlineInfo()
    }, [currentUser])

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
                        <Button loading={loaders.fund} onClick={() => fund()} primary>Fund 10 Ethers</Button>
                    </div>}
                    {(airlineInfo.registered && airlineInfo.funded) && <div className='register'>
                        <h2>Register or Vote for new Airline</h2>
                        <Input focus onChange={handleChange} placeholder="new airline address" value={address}></Input>
                        <Button loading={loaders.regAirline} onClick={() => submitAirline(address)} primary floated="right">Register / Vote</Button>
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
                            <input type="time" onChange={handleFlightChange} placeholder="HH:MM" name="time" value={flight.time}/>
                        </Form.Field>
                        <Form.Button loading={loaders.regFlight} floated="right" type="submit">Submit</Form.Button>
                    </Form>
                </Grid.Column>
                <Grid.Column width = {11}>
                    <h2>Flights</h2>
                    <FlightTable/>
                </Grid.Column>
            </Grid.Row>}
        </Grid>
    </>)
}

export default Airline