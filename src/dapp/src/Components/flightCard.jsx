import { Table } from 'semantic-ui-react'

const FlightTable = (props) => {
    console.log("render FlightTable");
    return (<>
        <Table celled inverted color="grey" size="large">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Flight #</Table.HeaderCell>
                    <Table.HeaderCell>Airline</Table.HeaderCell>
                    <Table.HeaderCell>Itinerary</Table.HeaderCell>
                    <Table.HeaderCell>Arrival Time</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {props.flights.map(flight => {
                    let airline = flight.airline ? flight.airline.substring(0,10) + "..." : "Undefined"
                    return (<>
                        <Table.Row key={flight.key}>
                            <Table.Cell>{flight.number}</Table.Cell>
                            <Table.Cell>{airline}</Table.Cell>
                            <Table.Cell>{flight.itinerary}</Table.Cell>
                            <Table.Cell>{flight.time}</Table.Cell>
                        </Table.Row>
                    </>)
                })}
            </Table.Body>
        </Table>
    </>)
}

export default FlightTable