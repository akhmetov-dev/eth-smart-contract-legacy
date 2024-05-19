import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Legacy", function () {
  
  it("Should add a legatee", async function () {
    const legacy = await hre.ethers.deployContract( "Legacy", [] );

    expect( (await legacy.getLegaties()).length ).to.equal(0);
    await legacy.addLegatee( "0x0000000000000000000011111111111111111111" );
    expect( (await legacy.getLegaties()).length ).to.equal(1);
  });
});