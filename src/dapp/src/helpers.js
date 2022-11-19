import contract from './contract';

export const generateStatusCode = () => {
    // for simulation purpose flight will be delayed by company's fault 50% of times
    let result = Math.random()
    if (result < 0.5) return 20
    else if (result > 0.9) return 0
    else if (result > 0.8) return 10
    else if (result > 0.7) return 30
    else if (result > 0.6) return 40
    else return 50
}

export const typeAccount = (account) => {
    if (account === contract.owner) {
        return "Owner"
    } 
    for (let i = 0; i < 5; i++) {
        if (account === contract.airlines[i]) {
            return "Airline"
        }
        if (account === contract.passengers[i]) {
            return `Passenger`
        }
    }
    return account
}

export const matchAccount = (account) => {
    if (account === contract.owner) {
        return "Contract Owner"
    } 
    for (let i = 0; i < 5; i++) {
        if (account === contract.airlines[i]) {
            return `Airline ${i+1}`
        }
        if (account === contract.passengers[i]) {
            return `Passenger ${i+1}`
        }
    }
    return account
}

