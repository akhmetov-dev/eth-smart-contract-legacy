import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Legacy", function () {

  async function deployLegacyFixture() {
    const [owner, another] = await hre.ethers.getSigners();
    const legacy = await hre.ethers.deployContract("Legacy", []);
    const legateeAddress = "0x0000000000000000000000000000000000000001";

    return { legacy, legateeAddress, owner, another };
  }

  it("should set the correct owner", async function () {
    const { legacy, owner } = await loadFixture(deployLegacyFixture);

    const contractOwner = await legacy.owner();
    expect(contractOwner).to.equal(owner.address);
  });

  it("should add a legatee", async function () {
    const { legacy, legateeAddress } = await loadFixture(deployLegacyFixture);

    expect((await legacy.getLegatees()).length).to.equal(0);
    await legacy.addLegatee(legateeAddress);

    const legatees = await legacy.getLegatees();
    expect(legatees.length).to.equal(1);
    expect(legatees[0]).to.equal(legateeAddress);
  });

  it("should not add a legatee by non-owner", async function () {
    const { legacy, legateeAddress, another } = await loadFixture(deployLegacyFixture);

    expect(legacy.connect(another).addLegatee(legateeAddress)).to.be.revertedWith("You aren't the owner");
  });

  it("should remove a legatee", async function () {
    const { legacy, legateeAddress } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    expect((await legacy.getLegatees()).length).to.equal(1);
    await legacy.removeLegatee(legateeAddress);
    expect((await legacy.getLegatees()).length).to.equal(0);
  });

  it("should not remove a legatee by non-owner", async function () {
    const { legacy, legateeAddress, another } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    expect(legacy.connect(another).removeLegatee(legateeAddress)).to.be.revertedWith("You aren't the owner");
  });

  it("should not remove non existing legatee", async function () {
    const { legacy, legateeAddress, another } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    expect(legacy.connect(another).removeLegatee(another)).to.be.revertedWith("Legatee not found");
  });
});
