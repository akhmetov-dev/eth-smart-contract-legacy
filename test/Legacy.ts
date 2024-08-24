import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";

describe("Legacy", function () {

  const ONE_ETHER_IN_WEI = 1_000_000_000_000_000_000n;

  async function deployLegacyFixture() {
    const legacy = await hre.ethers.deployContract("Legacy", []);
    const [
      owner, 
      another,
      legateeAddress,
      legateeAddress2,
      legateeAddress3,
      legateeAddress4,
      legateeAddress5
    ] = await hre.ethers.getSigners();

    return {
      legacy,
      owner,
      another,
      legateeAddress,
      legateeAddress2,
      legateeAddress3,
      legateeAddress4,
      legateeAddress5
    };
  }

  it("should set the correct owner", async function () {
    const { legacy, owner } = await loadFixture(deployLegacyFixture);

    expect(await legacy.owner()).to.equal(owner.address);
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

    await expect(legacy.connect(another).addLegatee(legateeAddress)).to.be.revertedWith("You aren't the owner");
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
    await expect(legacy.connect(another).removeLegatee(legateeAddress)).to.be.revertedWith("You aren't the owner");
  });

  it("should not remove non existing legatee", async function () {
    const { legacy, legateeAddress, another } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    await expect(legacy.removeLegatee(another)).to.be.revertedWith("Legatee not found");
  });

  it("should deposit funds", async function () {
    const { legacy } = await loadFixture(deployLegacyFixture);

    expect(await legacy.getBalance()).to.equal(0);
    await legacy.deposit({ value: 1 });
    expect(await legacy.getBalance()).to.equal(1);
  });

  it("should not deposit a non-owner", async function () {
    const { legacy, another } = await loadFixture(deployLegacyFixture);

    await expect(legacy.connect(another).deposit({ value: 1 })).to.be.revertedWith("You aren't the owner");
  });

  it("should set distribution", async function () {
    const { legacy, legateeAddress } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    expect(await legacy.getDistribution(legateeAddress)).to.equal(0);

    await legacy.setDistribution(legateeAddress, 1);
    expect(await legacy.getDistribution(legateeAddress)).to.equal(1);
  });

  it("should not set distribution for non existing legatee", async function () {
    const { legacy, legateeAddress, another } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    await expect(legacy.setDistribution(another, 1)).to.be.revertedWith("Legatee not found");
  });

  it("should not set distribution by non-owner", async function () {
    const { legacy, legateeAddress, another } = await loadFixture(deployLegacyFixture);

    await expect(legacy.connect(another).setDistribution(legateeAddress, 1)).to.be.revertedWith("You aren't the owner");
  });

  it("should be closed for distribution by default", async function () {
    const { legacy } = await loadFixture(deployLegacyFixture);

    expect(await legacy.legacyCanBeDistributed()).to.equal(false);
  });

  it("should be opened for distribution by owner", async function () {
    const { legacy } = await loadFixture(deployLegacyFixture);

    await legacy.allowLegacyDistributionByOwner();

    expect(await legacy.legacyCanBeDistributed()).to.equal(true);
  });

  it("should not be opened for distribution by non owner", async function () {
    const { legacy, another } = await loadFixture(deployLegacyFixture);

    await expect(legacy.connect(another).allowLegacyDistributionByOwner()).to.be.revertedWith("You aren't the owner");
  });

  it("should be opened for distribution by legatees consensus (1 legatee)", async function () {
    const {
      legacy,
      legateeAddress
    } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);

    expect(await legacy.legacyCanBeDistributed()).to.equal(false);

    await legacy.connect(legateeAddress).allowLegacyDistributionByLegateesConsensus();
    expect(await legacy.legacyCanBeDistributed()).to.equal(true);
  });

  it("should be opened for distribution by legatees consensus (3 legatees)", async function () {
    const {
      legacy,
      legateeAddress,
      legateeAddress2,
      legateeAddress3
    } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    await legacy.addLegatee(legateeAddress2);
    await legacy.addLegatee(legateeAddress3);

    expect(await legacy.legacyCanBeDistributed()).to.equal(false);

    await legacy.connect(legateeAddress).allowLegacyDistributionByLegateesConsensus();
    expect(await legacy.legacyCanBeDistributed()).to.equal(false);

    await legacy.connect(legateeAddress2).allowLegacyDistributionByLegateesConsensus();
    expect(await legacy.legacyCanBeDistributed()).to.equal(true);
  });

  it("should be opened for distribution by legatees consensus (5 legatees)", async function () {

    const {
      legacy,
      legateeAddress,
      legateeAddress2,
      legateeAddress3,
      legateeAddress4,
      legateeAddress5
    } = await loadFixture(deployLegacyFixture);

    await legacy.addLegatee(legateeAddress);
    await legacy.addLegatee(legateeAddress2);
    await legacy.addLegatee(legateeAddress3);
    await legacy.addLegatee(legateeAddress4);
    await legacy.addLegatee(legateeAddress5);

    expect(await legacy.legacyCanBeDistributed()).to.equal(false);

    await legacy.connect(legateeAddress).allowLegacyDistributionByLegateesConsensus();
    expect(await legacy.legacyCanBeDistributed()).to.equal(false);

    await legacy.connect(legateeAddress2).allowLegacyDistributionByLegateesConsensus();
    expect(await legacy.legacyCanBeDistributed()).to.equal(false);

    await legacy.connect(legateeAddress3).allowLegacyDistributionByLegateesConsensus();
    expect(await legacy.legacyCanBeDistributed()).to.equal(true);
  });

  it("should send legacy to legatee", async function () {
    const { legacy, legateeAddress } = await loadFixture(deployLegacyFixture);

    var legateeBalance = await hre.ethers.provider.getBalance(legateeAddress);

    legacy.deposit({ value: ONE_ETHER_IN_WEI });

    await legacy.addLegatee(legateeAddress);

    await legacy.setDistribution(legateeAddress, 100);

    await legacy.connect(legateeAddress).allowLegacyDistributionByLegateesConsensus();

    await legacy.connect(legateeAddress).claimLegacy();

    var newLegateeBalance = await hre.ethers.provider.getBalance(legateeAddress);

    expect(newLegateeBalance).to.greaterThanOrEqual(legateeBalance);
  });
});
