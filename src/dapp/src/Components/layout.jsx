import React from "react";
import { Container, Loader, Dimmer, Segment, Image } from "semantic-ui-react";
import Navbar from './navbar';
import "./layout.css"
import { useGlobalContext } from "../context";

const Layout = ({children}) => {
    const {fetching} = useGlobalContext()

    return (
        <Container>
            <Navbar/>
            <div className="black-background">
            
                <Dimmer active={fetching} page>
                    <Loader/>
                     
                </Dimmer>
                {!fetching && children} 
            
                
            </div>
            
        </Container>
    );
};

export default Layout