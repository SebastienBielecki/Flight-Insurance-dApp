import React from "react";
import { Container } from "semantic-ui-react";
import Navbar from './navbar';
import "./layout.css"

const Layout = ({children}) => {
    return (
        <Container>
            <Navbar/>
            <div className="black-background">
                <div>
                    {children}
                </div>
            </div>
        </Container>
    );
};

export default Layout