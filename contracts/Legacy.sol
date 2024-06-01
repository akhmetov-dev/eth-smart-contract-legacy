// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// import "hardhat/console.sol";

contract Legacy {
    address public owner;
    address[] public legatees;
    mapping(address => uint8) public legacyDistribution;

    event LegateeAdded(address legatee, uint8 distribution);
    event LegateeRemoved(address legatee);
    event FundsDeposited(address sender, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    function addLegatee(address _legatee) public onlyOwner {
        legatees.push(_legatee);
        emit LegateeAdded(_legatee, legacyDistribution[_legatee]);
    }

    function getLegatees() public view onlyOwner returns (address[] memory) {
        return legatees;
    }

    function removeLegatee(address _legatee) public onlyOwner {
        uint index = findLegateeAddressIndex(_legatee);
        require(index < legatees.length, "Legatee not found");
        legacyDistribution[_legatee] = 0;
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
        return legacyDistribution[_legatee];
    }

    function setDistribution(address _legatee, uint8 _distribution) public onlyOwner {
        uint index = findLegateeAddressIndex(_legatee);
        require(index < legatees.length, "Legatee not found");
        legacyDistribution[_legatee] = _distribution;
    }
}
