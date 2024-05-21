// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// import "hardhat/console.sol";

contract Legacy {
    address public owner;
    address[] public legatees;
    mapping(address => uint) public legacyDistribution;

    event LegateeAdded(address legatee, uint distribution);

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
}
