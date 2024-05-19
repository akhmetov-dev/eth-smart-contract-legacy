// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract Legacy {
    address public owner;
    address[] public legaties;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    function addLegatee( address _legatee ) public onlyOwner {
        console.log(_legatee);
        legaties.push( _legatee );
    }

    function getLegaties() public view onlyOwner returns ( address[] memory ) {
        return legaties;
    }
}
