import "./passengers.css"
import FlightTable from "./flightTable"
import { Divider, Button, Input, Card } from "semantic-ui-react"
import { useEffect, useState } from "react"
import { useGlobalContext } from "../context"
import contract from '../contract';


const Passenger = () => {
    const { loaders, setLoaders, message, setMessage, handleError, currentUser } = useGlobalContext()
    let shortAccount = currentUser.account.substring(0,10) + "..."
    const [balance, setBalance] = useState()
    const [fetchPaidInsurance, setPaidInsurance] = useState([])

    
    useEffect(() => {
        const getBalance = async () => {
            try {
                let result = await contract.web3.eth.getBalance(currentUser.account)
                result = contract.web3.utils.fromWei(result, "ether")
                result = (Math.round(result * 100) / 100).toFixed(2)
                setBalance(result)
            } catch (error) {
                handleError(error)
            }
        }
        getBalance()
    }, [])
    

    return (<>
        <FlightTable/>
        <Divider></Divider>
        {/* <h3 className="form label-form">Flight #</h3> 
        <Input type="text" id="flight-number"></Input>
        <Button primary id="submit-oracle">Submit to Oracles</Button> */}
        <h2>My financial information</h2>
        <Card.Group>
            <Card>
                <Card.Content>
                    <Card.Header>Funds in my personal Wallet</Card.Header>
                    <Card.Meta>{shortAccount}</Card.Meta>
                    <Card.Description>
                    {balance + " Ethers"}
                    </Card.Description>
                </Card.Content>
            </Card>
            <Card>
                <Card.Content>
                    <Card.Header>Available Funds</Card.Header>
                    <Card.Meta>Paid insurance from delayed flights</Card.Meta>
                    <Card.Description>
                    {balance + " Ethers"}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    {/* <div className='ui two buttons'> */}
                    <Button color='blue' floated="right">
                        Refund
                    </Button>
                  
                    {/* </div> */}
                </Card.Content>
            </Card>
        </Card.Group>

    </>)
}

export default Passenger

