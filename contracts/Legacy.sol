// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// import "hardhat/console.sol";

contract Legacy {
    address public owner;
    address[] public legatees;

    struct Legatee{
        uint8 distribution;
        bool legacyCanBeDistributed;
    }

    mapping(address => Legatee) public legacyDistribution;
    bool public legacyCanBeDistributed;

    event LegateeAdded(address legatee, uint8 distribution);
    event LegateeRemoved(address legatee);
    event FundsDeposited(address owner, uint amount);
    event LegacyCanBeDistributed(address[] legatees);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    modifier onlyLegatee() {
        uint index = findLegateeAddressIndex(msg.sender);
        require(index < legatees.length, "Legatee not found");
        _;
    }

    function addLegatee(address _legatee) public onlyOwner {
        legatees.push(_legatee);
        emit LegateeAdded(_legatee, legacyDistribution[_legatee].distribution);
    }

    function getLegatees() public view onlyOwner returns (address[] memory) {
        return legatees;
    }

    function removeLegatee(address _legatee) public onlyOwner {
        uint index = findLegateeAddressIndex(_legatee);
        require(index < legatees.length, "Legatee not found");

        Legatee memory legatee = legacyDistribution[_legatee];
        legatee.distribution = 0;
        legatee.legacyCanBeDistributed = false;

        legatees[index] = legatees[legatees.length - 1];
        legatees.pop();
        emit LegateeRemoved(_legatee);
    }

    function findLegateeAddressIndex(address _address) private view returns (uint) {
        for (uint i = 0; i < legatees.length; i++) {
            if (legatees[i] == _address) {
                return i;
            }
        }
        return type(uint).max;
    }

    function deposit() public payable onlyOwner {
        require(msg.value > 0, "Deposit value must be greater than 0");
        emit FundsDeposited(msg.sender, msg.value);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getDistribution(address _legatee) public view onlyOwner returns (uint) {
        uint index = findLegateeAddressIndex(_legatee);
        require(index < legatees.length, "Legatee not found");
        return legacyDistribution[_legatee].distribution;
    }

    function setDistribution(address _legatee, uint8 _distribution) public onlyOwner {
        uint index = findLegateeAddressIndex(_legatee);
        require(index < legatees.length, "Legatee not found");
        legacyDistribution[_legatee].distribution = _distribution;
    }

    function allowLegacyDistributionByOwner() public onlyOwner {
        legacyCanBeDistributed = true;
        emit LegacyCanBeDistributed(legatees);
    }

    function allowLegacyDistributionByLegateesConsensus() public onlyLegatee {
        // TODO unit-tests
        legacyDistribution[msg.sender].legacyCanBeDistributed = true;

        uint votedLegateesCount = countVotedLegatees();
        if(votedLegateesCount > ((legatees.length / 2) + 1)) {
            legacyCanBeDistributed = true;
            emit LegacyCanBeDistributed(legatees);
        }
    }

    function countVotedLegatees() private view returns (uint) {
        uint votedLegateesCount;
        for (uint i = 0; i < legatees.length; i++) {
            if (legacyDistribution[legatees[i]].legacyCanBeDistributed == true) {
                votedLegateesCount++;
            }
        }
        return votedLegateesCount;
    }
}
