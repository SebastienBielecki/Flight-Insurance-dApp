import "./passengers.css"
import FlightTable from "./flightTable"
import { Divider, Button, Input, Card, Header } from "semantic-ui-react"
import { useEffect, useState } from "react"
import { useGlobalContext } from "../context"
import contract from '../contract';


const Passenger = () => {
    const { loaders, setLoaders, message, setMessage, handleError, currentUser, insurance } = useGlobalContext()
    let shortAccount = currentUser.account.substring(0,10) + "..."
    const [balances, setBalances] = useState({})
    //const [fetchPaidInsurance, setPaidInsurance] = useState([])

    const getBalance = async () => {
        console.log("get balance triggered");
        try {
            let balance = await contract.web3.eth.getBalance(currentUser.account)
            balance = contract.web3.utils.fromWei(balance, "ether")
            balance = (Math.round(balance * 100) / 100).toFixed(2)
            let credit = await contract.flightSuretyApp.methods.getPassengerCredit().call({from: currentUser.account})
            credit = contract.web3.utils.fromWei(credit, "ether")
            credit = (Math.round(credit * 100) / 100).toFixed(2)
            setBalances({balance, credit})
        } catch (error) {
            handleError(error)
        }
    }
    
    useEffect(() => {
        getBalance()
    },[currentUser])

    const handleRefund = async () => {
        setMessage({display: false})
        setLoaders({refund: true})
        try {
            await contract.flightSuretyApp.methods.pay().send({from: currentUser.account})
            setLoaders({})
        } catch (error) {
            handleError(error)
        }
        await getBalance()
    }
    

    return (<>
        <Header as='h2' color="blue">Buy insurance</Header>
        <p>Get refunded 1.5 times if flight is delayed due to airline responsiblity</p>
        <FlightTable
            getBalance={getBalance}
        />
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
                    {balances.balance + " Ethers"}
                    </Card.Description>
                </Card.Content>
            </Card>
            <Card>
                <Card.Content>
                    <Card.Header>Available Funds</Card.Header>
                    <Card.Meta>Credited insurance from delayed flights</Card.Meta>
                    <Card.Description>
                    {balances.credit + " Ethers"}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    {/* <div className='ui two buttons'> */}
                    <Button color='blue' floated="right" onClick={handleRefund} loading={loaders.refund}>
                        Send to personal Wallet
                        
                    </Button>
                  
                    {/* </div> */}
                </Card.Content>
            </Card>
        </Card.Group>

    </>)
}

export default Passenger

