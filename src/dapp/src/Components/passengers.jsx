import "./passengers.css"

const Passenger = () => {
    return (<>
        <label className="form">Flight</label> 
        <input type="text" id="flight-number"></input>
        <button className="btn btn-primary" id="submit-oracle">Submit to Oracles</button>
    </>)
}

export default Passenger

