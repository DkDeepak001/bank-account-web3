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

  async function deployBankAccountWithAccounts(
    owners = 1,
    deposit = 0,
    withdrawlAmounts: number[] = []
  ): Promise<BankAccount<SignerWithAddress>> {
    const { bankAccount, addr0, addr1, addr2, addr3, addr4 } =
      await loadFixture(deploy);
    let addresses: String[] = [];

    if (owners == 1) addresses = [addr0.address];
    else if (owners == 2) addresses = [addr0.address, addr1.address];
    else if (owners == 3)
      addresses = [addr0.address, addr1.address, addr2.address];

    await bankAccount.connect(addr0).createAccount(addresses);

    if (deposit > 0) {
      await bankAccount
        .connect(addr0)
        .deposite(1, { value: deposit.toString() });
    }

    for (const withdrawlAmount of withdrawlAmounts) {
      await bankAccount.connect(addr0).requestWithdraw(1, withdrawlAmount);
    }

    return { bankAccount, addr0, addr1, addr2, addr3, addr4 };
  }

  describe("Deployment", () => {
    it("Should deploy without error", async () => {
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

  it("should not allow user to create more than 4 account", async function (): Promise<void> {
    const { bankAccount, addr1, addr2, addr3 } = await loadFixture(deploy);

    await bankAccount
      .connect(addr1)
      .createAccount([addr1.address, addr2.address, addr3.address]);
    await bankAccount
      .connect(addr1)
      .createAccount([addr1.address, addr2.address, addr3.address]);
    await bankAccount
      .connect(addr1)
      .createAccount([addr1.address, addr2.address, addr3.address]);
    await bankAccount
      .connect(addr1)
      .createAccount([addr1.address, addr2.address, addr3.address]);

    await expect(
      bankAccount
        .connect(addr1)
        .createAccount([addr1.address, addr2.address, addr3.address])
    ).to.be.reverted;
  });

  describe("Despositing", async (): Promise<void> => {
    it("should allow deposit from account owner", async (): Promise<void> => {
      const { bankAccount, addr0 } = await deployBankAccountWithAccounts(1);

      await expect(
        bankAccount.connect(addr0).deposite(1, { value: "100" })
      ).to.changeEtherBalances([bankAccount, addr0], ["100", "-100"]);
    });

    it("should NOT allow deposit from non-account owner", async () => {
      const { bankAccount, addr1 } = await deployBankAccountWithAccounts(1);
      await expect(bankAccount.connect(addr1).deposite(0, { value: "100" })).to
        .be.reverted;
    });
  });

  describe("Withdraw", () => {
    describe("Request a withdraw", () => {
      it("account owner can request withdraw", async () => {
        const { bankAccount, addr0 } = await deployBankAccountWithAccounts(
          1,
          100
        );
        await bankAccount.connect(addr0).requestWithdraw(1, 100);
      });

      it("account owner can not request withdraw with invalid amount", async () => {
        const { bankAccount, addr0 } = await deployBankAccountWithAccounts(
          1,
          100
        );
        await expect(bankAccount.connect(addr0).requestWithdraw(1, 101)).to.be
          .reverted;
      });

      it("non-account owner cannot request withdraw", async () => {
        const { bankAccount, addr1 } = await deployBankAccountWithAccounts(
          1,
          100
        );
        await expect(bankAccount.connect(addr1).requestWithdraw(1, 90)).to.be
          .reverted;
      });

      it("non-account owner cannot request withdraw", async () => {
        const { bankAccount, addr0 } = await deployBankAccountWithAccounts(
          1,
          100
        );
        await bankAccount.connect(addr0).requestWithdraw(1, 90);
        await bankAccount.connect(addr0).requestWithdraw(1, 10);
      });
    });

    describe("Approve a withdraw", () => {
      it("should allow account owner to approve withdraw", async () => {
        const { bankAccount, addr1 } = await deployBankAccountWithAccounts(
          2,
          100,
          [100]
        );
        await bankAccount.connect(addr1).approveWithdraw(1, 1);
        expect(await bankAccount.getNoOfApproval(1, 1)).to.equal(1);
      });

      it("should not allow non-account owner to approve withdraw", async () => {
        const { bankAccount, addr2 } = await deployBankAccountWithAccounts(
          2,
          100,
          [100]
        );
        await expect(bankAccount.connect(addr2).approveWithdraw(0, 0)).to.be
          .reverted;
      });

      it("should not allow owner to approve withdrawl multiple times", async () => {
        const { bankAccount, addr1 } = await deployBankAccountWithAccounts(
          2,
          100,
          [100]
        );
        bankAccount.connect(addr1).approveWithdraw(1, 1);
        await expect(bankAccount.connect(addr1).approveWithdraw(1, 1)).to.be
          .reverted;
      });

      it("should not allow creator of request to approve request", async () => {
        const { bankAccount, addr0 } = await deployBankAccountWithAccounts(
          2,
          100,
          [100]
        );
        await expect(bankAccount.connect(addr0).approveWithdraw(1, 1)).to.be
          .reverted;
      });
    });

    describe("Make withdraw", () => {
      it("should allow creator of request to withdraw approved request", async () => {
        const { bankAccount, addr0, addr1 } =
          await deployBankAccountWithAccounts(2, 100, [100]);
        await bankAccount.connect(addr1).approveWithdraw(1, 1);
        await expect(
          bankAccount.connect(addr0).withdrawAmount(1, 1)
        ).to.changeEtherBalances([bankAccount, addr0], ["-100", "100"]);
      });

      it("should not allow creator of request to withdraw approved request twice", async () => {
        const { bankAccount, addr0, addr1 } =
          await deployBankAccountWithAccounts(2, 200, [100]);
        await bankAccount.connect(addr1).approveWithdraw(1, 1);
        await expect(
          bankAccount.connect(addr0).withdrawAmount(1, 1)
        ).to.changeEtherBalances([bankAccount, addr0], ["-100", "100"]);
        await expect(bankAccount.connect(addr0).withdrawAmount(1, 1)).to.be
          .reverted;
      });

      it("should not allow non-creator of request to withdraw approved request ", async () => {
        const { bankAccount, addr1 } = await deployBankAccountWithAccounts(
          2,
          200,
          [100]
        );
        await bankAccount.connect(addr1).approveWithdraw(1, 1);
        await expect(bankAccount.connect(addr1).withdrawAmount(1, 1)).to.be
          .reverted;
      });

      it("should not allow non-creator of request to withdraw approved request ", async () => {
        const { bankAccount, addr0 } = await deployBankAccountWithAccounts(
          2,
          200,
          [100]
        );
        await expect(bankAccount.connect(addr0).withdrawAmount(1, 1)).to.be
          .reverted;
      });
    });
  });
});
