const hre = require('hardhat');
const ethers = hre.ethers;
const LegacyArtifact = require('../artifacts/contracts/Legacy.sol/Legacy.json');

async function main() {
    const [acc1, acc2] = await ethers.getSigners();

    // Send a value from acc1 to acc2
    // send(acc1, acc2, '1.5');

    const solidityContract = new ethers.Contract(
        // Contract address
        '0x5fbdb2315678afecb367f032d93f642f64180aa3',
        // Contract abi (description)
        LegacyArtifact.abi,
        // Account-interactor
        acc1
    );

    console.log(await solidityContract.getLegatees());
    await solidityContract.addLegatee('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    console.log(await solidityContract.getLegatees());
}

async function send(fromAcc: any, toAcc : any, value : String) {
    const tx = {
        to: toAcc.address,
        value: ethers.parseEther(value)
    };

    const txSend = await fromAcc.sendTransaction(tx);
    await txSend.wait();
}

main();
