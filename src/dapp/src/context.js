import React, {useState, useContext} from "react"


const AppContext = React.createContext()

const AppProvider = ({children}) => {

    const [loaders, setLoaders] = useState({})
    const [message, setMessage] = useState({header: "", content: "", display:false, type: ""})
    const [currentUser, setCurrentUser] = useState({})
    const [appContractAuthorized, setAppContractAuthorized] = useState(false)
    const [operational, setOperational] = useState(false);
    const [flights, setFlights] = useState([])
    const [fetching, setFetching] = useState(false)

    const handleError = (error) => {
        console.log(error);
        setMessage({
            negative: true,
            display: true,
            header: "There was an error",
            content: error.message
        })
        setLoaders({})
      }

    return (
        <AppContext.Provider
              value={{
                currentUser, 
                setCurrentUser,
                loaders,
                setLoaders,
                message,
                setMessage,
                handleError,
                operational,
                setOperational,
                appContractAuthorized,
                setAppContractAuthorized,
                flights,
                setFlights,
                fetching,
                setFetching
              }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useGlobalContext = () => {
    return useContext(AppContext)
}

export {AppContext, AppProvider}