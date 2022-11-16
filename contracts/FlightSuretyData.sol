pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    // this variable will store authorized App contracts
    mapping(address => bool) authorizedAppContracts;
    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

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

    struct Passenger {
        address wallet;
        // balance that the smart contract owns to the passenger
        uint256 balance;
        // maps amount of insurance paid for a flight
        mapping(bytes32 => uint256) paidInsurance;
    }
    uint256 private registeredAirlinesTotal;
    uint256 private haveFundedAirlinesTotal;

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

    event Authorized(address appAddress, bool auth);
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

    modifier requireAuthorizedAppContract() {
        require(authorizedAppContracts[msg.sender], "Calling contract is not authorized");
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

     function toggleAppContractAuthorization(address _dataContractAddress) public requireContractOwner {
        authorizedAppContracts[_dataContractAddress] = !authorizedAppContracts[_dataContractAddress];
        emit Authorized(_dataContractAddress, authorizedAppContracts[_dataContractAddress]);
    }
    // De-Authorize a Data Contract to call functions of this Data Contract
    // function deAuthorizeAppContract(address _dataContractAddress) public requireContractOwner {
    //     authorizedAppContracts[_dataContractAddress] = false;
    // }

    function testAuthContractAccess() external requireAuthorizedAppContract returns (bool){
        return true;
    }

    function isAppContractAuthorized(address appContract) public view returns (bool) {
        return authorizedAppContracts[appContract];
    }

    function getNumberOfRegisteredAirlines() external view requireAuthorizedAppContract returns(uint){
        return registeredAirlinesTotal;
    }

    function getNumberOfFundingAirlines() external view requireAuthorizedAppContract returns(uint){
        return haveFundedAirlinesTotal;
    }

    function getAirlineInfo(address airlineAddress) external view requireAuthorizedAppContract returns(uint, string, bool, bool) {
        return (airlines[airlineAddress].id, airlines[airlineAddress].name, airlines[airlineAddress].isRegistered, airlines[airlineAddress].hasFunded);
    }

    function getVotesCount(address airlineAddress) external view returns(uint) {
        return votesToRegister[airlineAddress].approvalCount;
    }

    function hasNotVoted(address candidate, address voter) external view returns (bool) {
        return !votesToRegister[candidate].voteMap[voter];
    }

    function registerVote(address candidate, address voter) external {
        votesToRegister[candidate].voteMap[voter] = true;
        votesToRegister[candidate].approvalCount =  votesToRegister[candidate].approvalCount.add(1);
    }


    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address newAirlineAddress, string airlineName) external requireIsOperational requireAuthorizedAppContract {
        registeredAirlinesTotal = registeredAirlinesTotal.add(1);
        airlines[newAirlineAddress] = Airlines(registeredAirlinesTotal, airlineName, true, false); 
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
    function fund(address caller) external payable requireIsOperational requireAuthorizedAppContract {
        airlines[caller].hasFunded = true;
        haveFundedAirlinesTotal = haveFundedAirlinesTotal.add(1);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Authorize a new Data Contract to call functions of this Data Contract
   

    

    
   /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable {
        //fund;
    }


}

