import { useState } from 'react';
import "./navbar.css"

const Navbar = (props) => {

    const matchAccount = (account) => {
        if (account === props.contract.owner) {
           return "Contract Owner"
        } 
        for (let i = 0; i < 5; i++) {
            if (account === props.contract.airlines[i]) {
                return `Airline ${i+1}`
            }
            if (account === props.contract.passengers[i]) {
                return `Passenger ${i+1}`
            }
        }
        return props.account
      }
      let name = matchAccount(props.account)

    return(<>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
            <a className="navbar-brand" href="/">FlightSurety</a>
            <button className="metamask btn btn-primary debug" onClick={() => console.log(props.contract)}>Log Contract</button>
            <div className='role'>
                <h4>{name}</h4>
                <p>{props.account}</p>
            </div>
            
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault"
                aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            
            
        </nav>
    </>)
}

export default Navbar