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
      expect(account.length).to.equal(1);
    });

    it("should create 2 user account without error", async function (): Promise<void> {
      const { bankAccount, addr1, addr2 } = await loadFixture(deploy);
      await bankAccount
        .connect(addr1)
        .createAccount([addr1.address, addr2.address]);
      const account1 = await bankAccount.connect(addr1).getUserAccounts();
      const account2 = await bankAccount.connect(addr2).getUserAccounts();
      expect(account1.length).to.equal(1);
      expect(account2.length).to.equal(1);
    });

    it("should create 3 user account without error", async function (): Promise<void> {
      const { bankAccount, addr1, addr2, addr3 } = await loadFixture(deploy);
      await bankAccount
        .connect(addr1)
        .createAccount([addr1.address, addr2.address, addr3.address]);
      const account1 = await bankAccount.connect(addr1).getUserAccounts();
      const account2 = await bankAccount.connect(addr2).getUserAccounts();
      const account3 = await bankAccount.connect(addr3).getUserAccounts();
      expect(account1.length).to.equal(1);
      expect(account2.length).to.equal(1);
      expect(account3.length).to.equal(1);
    });
  });

  it("should not allow user with duplicate account", async function (): Promise<void> {
    const { bankAccount, addr1, addr2 } = await loadFixture(deploy);

    await expect(
      bankAccount.connect(addr1).createAccount([addr1.address, addr1.address])
    ).to.be.revertedWith("you can't have duplicated owners");
  });

  it("should not allow user with more than 3 account", async function (): Promise<void> {
    const { bankAccount, addr1, addr2, addr3, addr4 } = await loadFixture(
      deploy
    );

    await expect(
      bankAccount
        .connect(addr1)
        .createAccount([
          addr1.address,
          addr2.address,
          addr3.address,
          addr4.address,
        ])
    ).to.be.reverted;
  });
});
