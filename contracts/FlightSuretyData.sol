pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    // this variable will store authorized App contracts
    mapping(address => bool) authorizedAppContracts;
    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    uint256 public constant MINIMUM_FUNDING = 10 ether;
    address private constant FIRST_AIRLINE_ADDRESS = 0xf17f52151EbEF6C7334FAD080c5704D77216b732;
    address private contractOwner;                                     // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    struct Airlines {
        uint256 id;
        string name;
        bool isRegistered;
        bool hasFunded;
    }

    struct Votes {
        uint256 approvalCount;
        mapping(address => bool) voteMap;
    }
    uint256 public registeredAirlinesTotal;
    uint256 public haveFundedAirlinesTotal;

    // This map will reference an airline address to its profile
    mapping(address => Airlines) private airlines;
    // This map will keep track of number of approvers to register a new airline
    mapping(address => Votes) public votesToRegister;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public {
        contractOwner = msg.sender;
        registeredAirlinesTotal = 1;
        haveFundedAirlinesTotal = 0;
        airlines[FIRST_AIRLINE_ADDRESS].id = registeredAirlinesTotal;
        airlines[FIRST_AIRLINE_ADDRESS].name = "Airline 1 (Founder)";
        airlines[FIRST_AIRLINE_ADDRESS].isRegistered = true;
        airlines[FIRST_AIRLINE_ADDRESS].hasFunded = false;
    
    }

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
        require(operational, "Contract is currently not operational");
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

    modifier registeredAirlineOnly() {
        require(airlines[msg.sender].isRegistered, "Airline is not registered");
        _;
    }

    modifier hasFundedOnly() {
        require(airlines[msg.sender].hasFunded, "Airline has not paid the initial funding");
        _;
    }

    modifier isFundingEnough() {
        require(msg.value >= MINIMUM_FUNDING, "Funding is not sufficient");
        _;
    }

    modifier requireAuthorizedAppContract() {
        require(authorizedAppContracts[msg.sender]);
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() public  view  returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address newAirlineAddress, string airlineName) external requireIsOperational hasFundedOnly {
        //require(airlines[msg.sender].hasFunded, "Calling arline has not funded and cannot register a new airline");
        if (registeredAirlinesTotal < 4) {
            registeredAirlinesTotal = registeredAirlinesTotal.add(1);
            airlines[newAirlineAddress].id = registeredAirlinesTotal;
            airlines[newAirlineAddress].name = airlineName;
            airlines[newAirlineAddress].isRegistered = true;
            airlines[newAirlineAddress].hasFunded = false;

        } else {
            require(!votesToRegister[newAirlineAddress].voteMap[msg.sender], "You have already voted");
            votesToRegister[newAirlineAddress].approvalCount = votesToRegister[newAirlineAddress].approvalCount.add(1);
            if (votesToRegister[newAirlineAddress].approvalCount.mul(2) >= haveFundedAirlinesTotal) {
                votesToRegister[newAirlineAddress].voteMap[msg.sender] = true;
                registeredAirlinesTotal = registeredAirlinesTotal.add(1);
                airlines[newAirlineAddress].id = registeredAirlinesTotal;
                airlines[newAirlineAddress].name = airlineName;
                airlines[newAirlineAddress].isRegistered = true;
                airlines[newAirlineAddress].hasFunded = false;
            }
        }
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy() external payable {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees() external pure {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() external pure {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund() public payable registeredAirlineOnly isFundingEnough requireIsOperational {
        airlines[msg.sender].hasFunded = true;
        haveFundedAirlinesTotal = haveFundedAirlinesTotal.add(1);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Authorize a new Data Contract to call functions of this Data Contract
    function authorizeAppContracts(address _dataContractAddress) public requireContractOwner {
        authorizedAppContracts[_dataContractAddress] = true;
    }
    // De-Authorize a Data Contract to call functions of this Data Contract
    function deAuthorizeAppContracts(address _dataContractAddress) public requireContractOwner {
        authorizedAppContracts[_dataContractAddress] = false;
    }

    function getAirlineInfo(address airlineAddress) public view returns(uint, string, bool, bool) {
        return (airlines[airlineAddress].id, airlines[airlineAddress].name, airlines[airlineAddress].isRegistered, airlines[airlineAddress].hasFunded);
    }

    function getVotesCount(address airlineAddress) public view returns(uint) {
        return votesToRegister[airlineAddress].approvalCount;
    }
   /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable {
        fund();
    }


}

