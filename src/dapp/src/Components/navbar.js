import "./navbar.css"
import { useGlobalContext } from '../context';
import { matchAccount } from "../helpers";

const Navbar = () => {

    const { currentUser } = useGlobalContext()

    return(<>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
            <a className="navbar-brand" href="/">FlightSurety</a>
            {/* <Button className="metamask btn btn-primary debug" onClick={() => console.log(props.contract)}>Log Contract</Button> */}
            <div className='role'>
                <h4>{matchAccount(currentUser.account)}</h4>
                <p>{currentUser.account}</p>
            </div>
            
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault"
                aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
        </nav>
    </>)
}

export default Navbar