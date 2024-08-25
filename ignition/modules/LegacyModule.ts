import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LegacyModule", (m) => {
    const legacy = m.contract("Legacy");
    return { legacy };
});
