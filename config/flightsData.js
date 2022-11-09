export const STATUS_CODE_UNKNOWN = 0;
export const STATUS_CODE_ON_TIME = 10;
export const STATUS_CODE_LATE_AIRLINE = 20;
export const STATUS_CODE_LATE_WEATHER = 30;
export const STATUS_CODE_LATE_TECHNICAL = 40;
export const STATUS_CODE_LATE_OTHER = 50;


export const Flights = [
    {   
        id: 1,
        airlineId: 1,
        airlineName: "Airline 1",
        trip: "Mexico - Paris",
        timestamp: new Date(2022, 11, 1, 8, 25),
        status: STATUS_CODE_ON_TIME
    },
    {   
        id: 2,
        airlineId: 1,
        airlineName: "Airline 1",
        trip: "London - Rome",
        timestamp: new Date(2022, 11, 1, 8, 55),
        status: STATUS_CODE_LATE_AIRLINE
    },
    {   
        id: 3,
        airlineId: 1,
        airlineName: "Airline 1",
        trip: "New York - Los Angeles",
        timestamp: new Date(2022, 11, 1, 9, 30),
        status: STATUS_CODE_LATE_TECHNICAL
    },
    {   
        id: 4,
        airlineId: 1,
        airlineName: "Airline 1",
        trip: "Delhi - Singapore",
        timestamp: new Date(2022, 11, 1, 10, 15),
        status: STATUS_CODE_LATE_AIRLINE
    },
    {   
        id: 5,
        airlineId: 1,
        airlineName: "Airline 1",
        trip: "Rio de Janereiro - Miami",
        timestamp: new Date(2022, 11, 1, 11, 5),
        status: STATUS_CODE_ON_TIME
    },
    {   
        id: 6,
        airlineId: 2,
        airlineName: "Airline 2",
        trip: "Sidney - Johannesburg",
        timestamp: new Date(2022, 11, 1, 13, 25),
        status: STATUS_CODE_ON_TIME
    },
    {   
        id: 7,
        airlineId: 2,
        airlineName: "Airline 2",
        trip: "Algiers - Madrid",
        timestamp: new Date(2022, 11, 1, 14, 5),
        status: STATUS_CODE_LATE_AIRLINE
    },
    {   
        id: 8,
        airlineId: 2,
        airlineName: "Airline 2",
        trip: "Berlin - Athens",
        timestamp: new Date(2022, 11, 1, 16, 55),
        status: STATUS_CODE_LATE_WEATHER
    },
    {   
        id: 9,
        airlineId: 2,
        airlineName: "Airline 2",
        trip: "Mexico - Paris",
        timestamp: new Date(2022, 11, 1, 17, 40),
        status: STATUS_CODE_LATE_AIRLINE
    },
    {   
        id: 10,
        airlineId: 2,
        airlineName: "Airline 2",
        trip: "Mexico - Paris",
        timestamp: new Date(2022, 11, 1, 19, 30),
        status: STATUS_CODE_ON_TIME
    },

]

