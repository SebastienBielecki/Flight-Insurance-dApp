pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Declare varialble of Data Contract type
    FlightSuretyData flightSuretyData;
    uint256 private minFunding;
    uint private flightNumber = 1;
    bool operational = true;
    address private dataContractAddress;

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address public contractOwner;          // Account used to deploy contract

    struct Flight {
        //bool isRegistered;
        uint number;
        string flight;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    mapping(bytes32 => Flight) public flights;
    // this array stores flights key, in order to be able ti persist flights key for the frontend
    // because it is not possible to iterate through a mapping
    bytes32[] flightsArray;

    event FlightRegistered(bytes32 key, uint number, address airline, string itinerary, uint256 time);

    event Funded(address founder);

 
    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsRegistered() {
        ( , , bool _isRegistered, ) = flightSuretyData.getAirlineInfo(msg.sender);
        require(_isRegistered, "Caller is not registered");
        _;
    }

    modifier requireHaveFunded() {
        ( , , , bool _hasFunded) = flightSuretyData.getAirlineInfo(msg.sender);
        require(_hasFunded, "Caller has not funded");
        _;
    }

    modifier isPayingEnough() {
        require(msg.value >= minFunding, "Funding insufficient");
        _;
    }

    modifier requireHasNotVoted(address candidate, address voter) {
        require(flightSuretyData.hasNotVoted(candidate, voter), "caller has already voted");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address _dataContract) public {
        contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(_dataContract);
        minFunding = 1 ether;
        dataContractAddress = _dataContract;
        flights[0x56556e7e8717edcb60f5aa0d49de71cca39e2eca163bf1e2bca5fe33128b872d].flight = "Mexico - Paris";
    }

    event Operational(bool mode);

    event RegisteredAirline (bool registerd, uint256 vote, uint256 totalAirlines);

    event InsuranceBought (bytes32 flightKey, address buyer, uint256 amount);

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public view returns(bool) {
        return operational;  
    }


    function toggleOperationalStatus() public requireContractOwner {
        operational = !operational;
        emit Operational(operational);
    }

    function testAuthContractAccess() returns (bool) {
        return flightSuretyData.testAuthContractAccess();
    }

    function getAirlineInfo(address airlineAddress) public view returns (uint, string, bool, bool) {
        return flightSuretyData.getAirlineInfo(airlineAddress);
    }

    function getNumberOfFundingAirlines() public view returns (uint) {
        (uint number) = flightSuretyData.getNumberOfFundingAirlines();
        return number;
    }

    function getVotesCount(address candidate) public view returns (uint) {
        return flightSuretyData.getVotesCount(candidate);
    }

    function getFlight(bytes32 key) public view returns (bytes32, uint, address, string, uint256) {
        return (key, flights[key].number, flights[key].airline, flights[key].flight, flights[key].updatedTimestamp);
    }

    function getFlightsArray() public view returns(bytes32[]) {
        return flightsArray;
    }

    function getFlightnumber() public view returns (uint256) {
        return flightNumber;
    }

    


    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerAirline(address _newAirlineAddress, string _airlineName) external requireHaveFunded requireHasNotVoted(_newAirlineAddress, msg.sender) returns(bool success, uint256 votes, uint256 requiredVotes) {
        uint numberOfAirlines = getNumberOfFundingAirlines();
        // require(numberOfAirlines < 4, "more than 4 airlines");
        if (numberOfAirlines < 4) {
            flightSuretyData.registerAirline(_newAirlineAddress, _airlineName);
            emit RegisteredAirline(true, 1, numberOfAirlines);
        } else {
            
            flightSuretyData.registerVote(_newAirlineAddress, msg.sender);
            uint vote = flightSuretyData.getVotesCount(_newAirlineAddress);
            //require(true == false, vote);
            if (vote.mul(2) >= numberOfAirlines) {
                flightSuretyData.registerAirline(_newAirlineAddress, _airlineName);
                emit RegisteredAirline(true, vote, numberOfAirlines);
            } else {
                emit RegisteredAirline(false, vote, numberOfAirlines);
            }
        }
    }

    function fund() public payable requireIsRegistered isPayingEnough {
        dataContractAddress.transfer(msg.value);
        flightSuretyData.fund(msg.sender);
        emit Funded(msg.sender);
    }


   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight(address _airline, uint256 _timestamp, uint8 _statusCode, string _flight) requireHaveFunded {
        bytes32 key = getFlightKey(_airline, _flight, _timestamp);
        flights[key] = Flight(flightNumber, _flight, _statusCode, _timestamp, _airline);
        flightsArray.push(key);
        emit FlightRegistered(key, flightNumber, _airline, _flight, _timestamp);
        flightNumber = flightNumber.add(1);
    }

    
    function buyInsurance(bytes32 key) external payable {
        dataContractAddress.transfer(msg.value);
        flightSuretyData.buy(msg.sender, msg.value, key);
        emit InsuranceBought(key, msg.sender, msg.value);
    }

    event PaidInsurances(uint256[] amounts);
    function getPaidInsurance(bytes32[] _flights) public view returns(uint256[] amounts){
        // returns(bytes32 memory keys[], uint256 memory amount[])
        emit PaidInsurances(flightSuretyData.getPaidInsurance(msg.sender, _flights));
        //return flightSuretyData.getPaidInsurance(msg.sender, _flights);
    }
    
   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal pure {
    
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus (address airline, string flight, uint256 timestamp) external {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, airline, flight, timestamp);
    } 


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle() external payable {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes() view external returns(uint8[3]) {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(uint8 index, address airline, string flight, uint256 timestamp, uint8 statusCode) external {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    function getFlightKey(address airline, string flight, uint256 timestamp) pure public returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account) internal returns(uint8[3]) {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account) internal returns (uint8) {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion
    
}   

// Data contract interface
contract FlightSuretyData {
    function registerAirline(address newAirlineAddress, string airlineName) external;
    function getNumberOfRegisteredAirlines() external view;
    function getNumberOfFundingAirlines() external view returns (uint);
    function getAirlineInfo(address airlineAddress) public view returns (uint, string, bool, bool);
    function fund(address caller) external payable;
    function testAuthContractAccess() returns (bool);
    function getVotesCount(address airlineAddress) external view returns(uint);
    function hasNotVoted(address candidate, address voter) external view returns (bool);
    function registerVote(address candidate, address voter) external;
    function buy(address _passenger, uint256 _amount, bytes32 _flight) external payable;
    function getPaidInsurance(address passenger, bytes32[] flights) external view returns(uint256[]);


}
