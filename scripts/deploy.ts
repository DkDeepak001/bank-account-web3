import { ethers } from "hardhat";
import { promises as fs } from "fs";
import { Contract } from "ethers";

async function main() {
  const BankAccount = await ethers.getContractFactory("BankAccount");
  const bankAccount = await BankAccount.deploy();
  await bankAccount.deployed();
  await deploymentInfo(bankAccount);
}

async function deploymentInfo(contract: Contract) {
  const data = {
    contract: {
      address: contract.address,
      abi: contract.interface.format(),
      signerAddress: contract.signer.address,
    },
  };
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile("deployment.json", content);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
