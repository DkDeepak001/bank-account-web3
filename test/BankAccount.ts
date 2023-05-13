import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

type BankAccount<T> = {
  bankAccount: Contract;
  addr0: T;
  addr1: T;
  addr2: T;
  addr3: T;
  addr4: T;
};

describe("BankAccount", function (): void {
  async function deploy(): Promise<BankAccount<SignerWithAddress>> {
    const [addr0, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const BankAccount = await ethers.getContractFactory("BankAccount");
    const bankAccount = await BankAccount.deploy();
    await bankAccount.deployed();
    return { bankAccount, addr0, addr1, addr2, addr3, addr4 };
  }

  describe("Deployment", function (): void {
    it("should deploy without error", async function (): Promise<void> {
      await loadFixture(deploy);
    });
  });

  describe("Create Account", function (): void {
    it("should create account without error", async function (): Promise<void> {
      const { bankAccount, addr1 } = await loadFixture(deploy);
      await bankAccount.connect(addr1).createAccount([addr1.address]);
      const account = await bankAccount.connect(addr1).getUserAccounts();
      console.log(account);
      expect(account.length).to.equal(1);
    });
  });
});
