import React from "react";
import { Container } from "semantic-ui-react";
import Navbar from './navbar';
import "./layout.css"

const Layout = (props) => {
    return (
        <Container>
            <Navbar
                account={props.account}
                contract={props.contract}
            ></Navbar>
            <div className="black-background">
                <div>
                    {props.children}
                </div>
            </div>
            
        </Container>
    );
};

export default Layout