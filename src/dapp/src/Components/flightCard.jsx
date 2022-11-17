import { Button, Table, Input } from 'semantic-ui-react'
import { useEffect, useState } from 'react';
import React from "react";

const FlightTable = (props) => {
    const [amount, setAmount] = useState({})
    const [insurance, setInsurance] = useState([])
    console.log("render FlightTable");

    
    useEffect(() => {
        const fetchPaidInsurance = async () => {
            let input = []
            props.flights.forEach(element => {
                input.push(element.key)
            });
            console.log("input of fectInsurances", input);
            let result = await props.contract.flightSuretyData.methods.getPaidInsurance(props.account, input).call({from: props.account})
            console.log("result of fetch insurances", result);
            let resultEther = result.map(element => {
                let temp = props.contract.web3.utils.fromWei(element, "ether")
                return (Math.round(temp * 100) / 100).toFixed(2)
            })
            
            setInsurance(resultEther)
        }
        fetchPaidInsurance()
    }, [])
    

    const handleAmountChange= (e) => {
        let {name, value} = e.target
        console.log(name, value);
        setAmount(prev => {
            return {
            ...prev, 
            [name]: value,
            }
        })
        // setAmount(prev => e.target.value)
    }

    const handleBuy = async () => {
        console.log("Buy clicked");
        let flightKey = Object.keys(amount)[0]
        let paid = amount[Object.keys(amount)[0]].toString()
        paid = props.contract.web3.utils.toWei(paid, "ether")
        console.log("FlightKey: ", flightKey)
        console.log("Amount: ", paid);
        let result = await props.contract.flightSuretyApp.methods.buyInsurance(flightKey).send({from: props.account, value: paid})
    }

    return (<>
        <Table celled inverted color="grey" size="large">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>FLIGHT #</Table.HeaderCell>
                    <Table.HeaderCell>AIRLINE</Table.HeaderCell>
                    <Table.HeaderCell>ITINERARY</Table.HeaderCell>
                    <Table.HeaderCell>ARRIVAL TIME</Table.HeaderCell>
                    <Table.HeaderCell>STATUS</Table.HeaderCell>
                    {props.userType === "Passenger" && 
                    <Table.HeaderCell>BUY INSURANCE <br></br> Pay up to 1 Ether and get refunded 1.5 times <br></br>when Flight delayed due to Airline fault</Table.HeaderCell>}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {props.flights.map((flight, index) => {
                    let airline = flight.airline ? flight.airline.substring(0,10) + "..." : "Undefined"
                    //let amountInsurance = props.contract.web3.utils.fromWei(insurance[index], "ether")
                    return (<React.Fragment key={flight.number}>
                        <Table.Row>
                            <Table.Cell>{flight.number}</Table.Cell>
                            <Table.Cell>{airline.toUpperCase()}</Table.Cell>
                            <Table.Cell>{flight.itinerary.toUpperCase()}</Table.Cell>
                            <Table.Cell>{flight.time}</Table.Cell>
                            <Table.Cell>ON TIME</Table.Cell>
                            {(props.userType === "Passenger" && insurance[index]=== "0.00") &&
                            <Table.HeaderCell>
                                <Input
                                    action={{
                                    color: 'teal',
                                    labelPosition: 'left',
                                    icon: 'ethereum',
                                    content: 'Buy Insurance',
                                    onClick: handleBuy
                                    }}
                            
                                    onClick={() => console.log("Buy clicked!")}
                                    actionPosition='right'
                                    placeholder='Amount in Ether'
                                    name={flight.key}
                                    value={amount.key}
                                    onChange={handleAmountChange}
                                    key={flight.key}
                                    // defaultValue='52.03'
                                />
                                
                            </Table.HeaderCell>}
                            {(props.userType === "Passenger" && insurance[index] !== "0.00") &&
                            <Table.HeaderCell>
                                Insured for {insurance[index]} Ether
                                {/* Paid for {props.contract.web3.utils.fromWei(insurance[index])} */}
                                <Button
                                    floated="right"
                                >
                                    Check Oracles
                                </Button>
                                
                            </Table.HeaderCell>}
                        </Table.Row>
                    </React.Fragment>)
                })}
            </Table.Body>
        </Table>
    </>)
}

export default FlightTable