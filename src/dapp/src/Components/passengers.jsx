import "./passengers.css"
import FlightTable from "./flightCard"
import { Divider, Button, Input } from "semantic-ui-react"


const Passenger = (props) => {
    return (<>
        <FlightTable
            flights={props.flights}
        ></FlightTable>
        <Divider></Divider>
        <h3 className="form label-form">Flight #</h3> 
        <Input type="text" id="flight-number"></Input>
        <Button primary id="submit-oracle">Submit to Oracles</Button>
    </>)
}

export default Passenger

