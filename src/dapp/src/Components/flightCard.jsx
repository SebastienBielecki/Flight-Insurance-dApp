import { Table } from 'semantic-ui-react'

const FlightTable = (props) => {
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
                    return (<>
                        <Table.Row>
                            <Table.Cell>{flight.number}</Table.Cell>
                            <Table.Cell>{flight.airline}</Table.Cell>
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