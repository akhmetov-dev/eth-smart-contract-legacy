import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Legacy", function () {

  async function beforeEach() {
    const legacy = await hre.ethers.deployContract("Legacy", []);
    const legateeAddress = "0x0000000000000000000000000000000000000001";

    return { legacy, legateeAddress };
  }

  it("should add a legatee", async function () {
    const { legacy, legateeAddress } = await loadFixture(beforeEach);

    expect((await legacy.getLegaties()).length).to.equal(0);
    await legacy.addLegatee(legateeAddress);

    const legaties = await legacy.getLegaties();
    expect(legaties.length).to.equal(1);
  });

  it("should return legaties", async function () {
    const { legacy, legateeAddress } = await loadFixture(beforeEach);

    await legacy.addLegatee(legateeAddress);

    const legaties = await legacy.getLegaties();
    expect(legaties[0]).to.equal(legateeAddress);
  });
});
