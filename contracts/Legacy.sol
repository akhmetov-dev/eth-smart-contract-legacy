// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

contract Legacy {
    address public owner;
    address[] private legatees;

    struct Legatee{
        uint8 distribution;
        bool legacyCanBeDistributed;
    }

    mapping(address => Legatee) private legacyDistribution;
    bool public legacyCanBeDistributed;

    event LegateeAdded(address legatee, uint8 distribution);
    event LegateeRemoved(address legatee);
    event FundsDeposited(address owner, uint amount);
    event LegacyCanBeDistributed(address[] legatees);
    event LegacyClaimed(address legateeAddress);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    modifier onlyLegatee() {
        require(findLegateeAddressIndex(msg.sender) < legatees.length, "Legatee not found");
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
        require(findLegateeAddressIndex(_legatee) < legatees.length, "Legatee not found");
        return legacyDistribution[_legatee].distribution;
    }

    function setDistribution(address _legatee, uint8 _distribution) public onlyOwner {
        require(findLegateeAddressIndex(_legatee) < legatees.length, "Legatee not found");
        legacyDistribution[_legatee].distribution = _distribution;
    }

    function allowLegacyDistributionByOwner() public onlyOwner {
        legacyCanBeDistributed = true;
        emit LegacyCanBeDistributed(legatees);
    }

    function allowLegacyDistributionByLegateesConsensus() public onlyLegatee {
        legacyDistribution[msg.sender].legacyCanBeDistributed = true;

        uint legateesCount = legatees.length;
        uint votedLegateesCount = countVotedLegatees();
        if(votedLegateesCount >= (legateesCount / 2 + (legateesCount % 2 == 0 ? 0 : 1))) {
            legacyCanBeDistributed = true;
        }
        emit LegacyCanBeDistributed(legatees);
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

    function claimLegacy() public onlyLegatee {
        address legateeAddress = msg.sender;

        uint8 distribution = legacyDistribution[legateeAddress].distribution;
        uint legacyAmount = address(this).balance / 100 * distribution;

        (bool sent, ) = legateeAddress.call{value: legacyAmount}("");

        require(sent, "Failed to claim legacy");

        emit LegacyClaimed(legateeAddress);
    }
}
