import { Button, Table, Input } from 'semantic-ui-react'
import { useEffect, useState } from 'react';
import React from "react";
import "./flightTable.css"
import { useGlobalContext } from '../context';
import contract from '../contract';

const FlightTable = ({getBalance}) => {
    const { loaders, setLoaders, message, setMessage, handleError, currentUser, flights } = useGlobalContext()
    const [amount, setAmount] = useState({})
    const [insurance, setInsurance] = useState([])
    const [insuranceCredited, setInsuranceCredited] = useState([])
    console.log("render FlightTable");

    const fetchPaidInsurance = async () => {
        console.log("FETCH PAID INSURANCES TRIGGERED");
        let flightKeys = []
        flights.forEach(element => {
            flightKeys.push(element.key)
        });
        let insurances = await contract.flightSuretyData.methods.getPaidInsurance(currentUser.account, flightKeys).call({from: currentUser.account})
        let insurancesRefunded = await contract.flightSuretyData.methods.getPaidInsuranceStatus(currentUser.account, flightKeys).call({from: currentUser.account})
        let insurancesEther = insurances.map(element => {
            let temp = contract.web3.utils.fromWei(element, "ether")
            return (Math.round(temp * 100) / 100).toFixed(2)
        })
        setInsurance(insurancesEther)
        setInsuranceCredited(insurancesRefunded)
    }

    const creditInsuree = async (i) => {
            console.log("CREDIT INSUREE TRIGGERED");
            console.log(insurance[i], insuranceCredited[i], flights[i].statusCode);
            if (flights[i].statusCode === "20" && insurance[i] !== "0" && !insuranceCredited[i]) {
                try {
                    console.log("refund conidition met");
                    await contract.flightSuretyData.methods.creditInsurees(currentUser.account, flights[i].key).send({from: currentUser.account})
                } catch (error) {
                    console.log(error.message);
                }
            }
        await getBalance()
        await fetchPaidInsurance()
    }

    useEffect(() => {
        
        if (currentUser.profile === "Passenger") {
            fetchPaidInsurance()
        }
    }, [currentUser])
    

    const handleAmountChange= (e) => {
        let {name, value} = e.target
        console.log(amount);
        setAmount(prev => {
            return {...prev, [name]: value}
        })
    }

    const handleBuy = async () => {
        let flightKey = Object.keys(amount)[0]
        console.log("FlightKey: ", flightKey);
        setLoaders({...loaders, [flightKey]: true})
        
        // let paid = amount[Object.keys(amount)[0]].toString()
        
        let paid = amount[Object.keys(amount)[0]]
        if (paid > 1) {
            setMessage({
                negative: true,
                display: true,
                header: "Error",
                content: "Maximum amount is 1 Ether"
            })
            setLoaders({})
            return
        }
        paid = contract.web3.utils.toWei(paid.toString(), "ether")

        console.log("FlightKey: ", flightKey)
        console.log("Amount: ", paid);
        try {
            await contract.flightSuretyApp.methods.buyInsurance(flightKey).send({from: currentUser.account, value: paid})
        } catch (error) {
            handleError(error)
        }
        setAmount({})
        await fetchPaidInsurance()
        await getBalance()
    }

    const handleClickOracle = async (airline, itinerary, time, key) => {
        console.log(airline, itinerary, time);
        setLoaders({oracle: true, [key]: true})
        try {
            let result = await contract.flightSuretyApp.methods.fetchFlightStatus(airline, itinerary, time).send({from: currentUser.account})
            console.log(result);
            setLoaders({})
            setMessage({
                positive: true,
                display: true,
                header: "Request successfully sent to Oracles",
                content: "Oracles are sending the answer."
            })
        } catch (error) {
            handleError(error)
        }
        
    }

    return (<>
        <Table celled inverted color="grey" size="large">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>AIRLINE</Table.HeaderCell>
                    <Table.HeaderCell>ITINERARY</Table.HeaderCell>
                    <Table.HeaderCell>ARRIVAL TIME</Table.HeaderCell>
                    <Table.HeaderCell>STATUS</Table.HeaderCell>
                    {currentUser.profile === "Passenger" && 
                    <Table.HeaderCell>BUY INSURANCE</Table.HeaderCell>}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {flights.map((flight, index) => {
                    const airline = flight.airline ? flight.airline.substring(0,10) + "..." : "Undefined"
                    const date = new Date(flight.time * 1000);
                    const hours = date.getHours()
                    const minutes = date.getMinutes()
                    
                    console.log (date)
                    //let amountInsurance = props.contract.web3.utils.fromWei(insurance[index], "ether")
                    return (<Table.Row key={flight.key}>
                            <Table.Cell>{airline.toUpperCase()}</Table.Cell>
                            <Table.Cell>{flight.itinerary.toUpperCase()}</Table.Cell>
                            <Table.Cell>{hours}:{minutes}</Table.Cell>
                            <Table.Cell>{contract.statusCodes[flight.statusCode]}</Table.Cell>
                            {(currentUser.profile === "Passenger" && insurance[index]=== "0.00" && flight.statusCode === "0") &&
                            <Table.HeaderCell>
                                <Input
                                    action={{
                                    color: 'teal',
                                    labelPosition: 'left',
                                    icon: 'ethereum',
                                    content: 'Buy Insurance',
                                    loading: loaders[flight.key],
                                    onClick: handleBuy
                                    }}
                            
                                    type="number"
                                    actionPosition='right'
                                    placeholder='Amount in Ether'
                                    name={flight.key}
                                    value={amount.key}
                                    onChange={handleAmountChange}
                                    key={flight.key}
                                    // defaultValue='52.03'
                                />
                                
                            </Table.HeaderCell>}
                            {(currentUser.profile === "Passenger" && insurance[index] !== "0.00" && flight.statusCode === "0") &&
                            <Table.HeaderCell>
                                Insured for {insurance[index]} Ether
                                <Button
                                    loading={loaders[flight.key] && loaders.oracle}
                                    floated="right"
                                    onClick={() => handleClickOracle(flight.airline, flight.itinerary, flight.time, flight.key)}
                                >
                                    Ask Oracles
                                </Button>
                                
                            </Table.HeaderCell>}
                            {(currentUser.profile === "Passenger" && insurance[index] !== "0.00" && !insuranceCredited[index] && flight.statusCode !== "20" && flight.statusCode !=="0") &&
                            <Table.HeaderCell>
                                    Insurance paid ${insurance[index]} Ether
                                    <br></br>
                                    Not refundable (On time or no Airline responsiblity)
                            </Table.HeaderCell>}
                            {(currentUser.profile === "Passenger" && insurance[index] != "0.00" && !insuranceCredited[index] && flight.statusCode === "20") &&
                            <Table.HeaderCell>
                                    Insurance paid ${insurance[index]} Ether
                                    <Button 
                                        floated="right"
                                        onClick={() => creditInsuree(index)}>
                                        Refund
                                    </Button>
                
                            </Table.HeaderCell>}
                            {(currentUser.profile === "Passenger" && insurance[index] !== "0.00" && insuranceCredited[index] && flight.statusCode === "20") &&
                            <Table.HeaderCell>
                                    Insurance paid ${insurance[index]} Ether
                                    <br></br>
                                    Credited 1.5X (Airline responsibility)
                            </Table.HeaderCell>}
                            {(currentUser.profile === "Passenger" && insurance[index] === "0.00" && flight.statusCode !== "0") &&
                            <Table.HeaderCell>
                                    No insurance paid
                            </Table.HeaderCell>}
                            
                            
                        </Table.Row>)
                    {/* </React.Fragment>) */}
                })}
            </Table.Body>
        </Table>
    </>)
}

export default FlightTable