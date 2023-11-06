import {
  time,
  loadFixture,
  impersonateAccount,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const APE_COIN_ADDRESS = "0x4d224452801ACEd8B2F0aebE155379bb5D594381";
const APE_COIN_STAKING_ADDRESS = "0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9";
const APE_COIN_VAULT_FEE_BPS = "500";
const IMPERSONATED_WHALE_ADDRESS = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

describe("ApeCoinVault Tests", () => {
  const deployedContracts = async () => {
    const apeCoin = await ethers.getContractAt("SimpleERC20", APE_COIN_ADDRESS);
    const apeCoinStaking = await ethers.getContractAt(
      "IApeCoinStaking",
      APE_COIN_STAKING_ADDRESS
    );

    const ApeCoinVault = await ethers.getContractFactory("ApeCoinVault");
    const apeCoinVault = await ApeCoinVault.deploy(
      APE_COIN_ADDRESS,
      APE_COIN_STAKING_ADDRESS,
      APE_COIN_VAULT_FEE_BPS
    );

    await apeCoinVault.waitForDeployment();

    await impersonateAccount(IMPERSONATED_WHALE_ADDRESS);

    const impersonatedWhaleAccount = await ethers.getSigner(
      IMPERSONATED_WHALE_ADDRESS
    );

    return {
      apeCoin,
      apeCoinStaking,
      apeCoinVault,
      impersonatedWhaleAccount,
    };
  };

  it("should successfully deploy ApeCoinVault with correct configuration", async () => {
    const { apeCoinVault } = await loadFixture(deployedContracts);

    const apeCoinAddress = await apeCoinVault.apeCoin();
    const apeCoinStaking = await apeCoinVault.apeCoinStaking();
    const apeCoinVaultFeeBps = await apeCoinVault.feeBps();

    expect(apeCoinAddress).to.equal(APE_COIN_ADDRESS);
    expect(apeCoinStaking).to.equal(APE_COIN_STAKING_ADDRESS);
    expect(apeCoinVaultFeeBps).to.equal(APE_COIN_VAULT_FEE_BPS);
  });

  it("should successfully deposit ApeCoin to the ApeCoinVault contract", async () => {
    const { apeCoin, apeCoinVault, impersonatedWhaleAccount } =
      await loadFixture(deployedContracts);

    await apeCoin
      .connect(impersonatedWhaleAccount)
      .approve(apeCoinVault.getAddress(), ethers.MaxUint256);

    await apeCoinVault
      .connect(impersonatedWhaleAccount)
      .deposit(
        "100000000000000000000000",
        impersonatedWhaleAccount.getAddress()
      );

    const stApeAmount = await apeCoinVault.balanceOf(
      impersonatedWhaleAccount.getAddress()
    );

    expect(stApeAmount).to.equal("100000000000000000000000");
  });

  it("should successfully withdraw ApeCoin from the ApeCoinVault contract", async () => {
    const { apeCoin, apeCoinVault, impersonatedWhaleAccount } =
      await loadFixture(deployedContracts);

    await apeCoin
      .connect(impersonatedWhaleAccount)
      .approve(apeCoinVault.getAddress(), ethers.MaxUint256);

    await apeCoinVault
      .connect(impersonatedWhaleAccount)
      .deposit(
        "100000000000000000000000",
        impersonatedWhaleAccount.getAddress()
      );

    const maxWithdraw = await apeCoinVault.maxWithdraw(
      impersonatedWhaleAccount.getAddress()
    );

    await apeCoinVault
      .connect(impersonatedWhaleAccount)
      .withdraw(
        maxWithdraw,
        impersonatedWhaleAccount.getAddress(),
        impersonatedWhaleAccount.getAddress()
      );
  });

  it("should successfully harvest ApeCoin rewards", async () => {
    const { apeCoin, apeCoinVault, impersonatedWhaleAccount } =
      await loadFixture(deployedContracts);
    const accounts = await ethers.getSigners();

    await apeCoin
      .connect(impersonatedWhaleAccount)
      .approve(apeCoinVault.getAddress(), ethers.MaxUint256);

    await apeCoinVault
      .connect(impersonatedWhaleAccount)
      .deposit(
        "100000000000000000000000",
        impersonatedWhaleAccount.getAddress()
      );

    await time.increase(3600);

    const apeCoinStakeInfoBeforeHarvest = await apeCoinVault.getApeCoinStake();

    const depositedBlanaceBeforeHarvest = apeCoinStakeInfoBeforeHarvest[2];
    const unclaimedBlanaceBeforeHarvest = apeCoinStakeInfoBeforeHarvest[3];

    expect(depositedBlanaceBeforeHarvest).to.equal("100000000000000000000000");
    expect(unclaimedBlanaceBeforeHarvest).to.equal("1980643788673900000");

    await expect(apeCoinVault.connect(accounts[0]).harvestApeCoinRewards())
      .to.emit(apeCoinVault, "HarvestApeCoinRewards")
      .withArgs("1980643788673900000", "99032189433695000");

    const apeCoinStakeInfoAfterHarvest = await apeCoinVault.getApeCoinStake();

    const depositedBlanaceAfterHarvest = apeCoinStakeInfoAfterHarvest[2];
    const unclaimedBlanaceAfterHarvest = apeCoinStakeInfoAfterHarvest[3];

    expect(depositedBlanaceAfterHarvest).to.equal("100001881611599240205000");
    expect(unclaimedBlanaceAfterHarvest).to.equal("0");

    const feeReceiverBalance = await apeCoin.balanceOf(
      accounts[0].getAddress()
    );

    expect(feeReceiverBalance).to.equal("99032189433695000");
  });

  it("should not restake on harvest if ApeCoin balance is less than 1 $APE", async () => {
    const { apeCoin, apeCoinVault, impersonatedWhaleAccount } =
      await loadFixture(deployedContracts);
    const accounts = await ethers.getSigners();

    await apeCoin
      .connect(impersonatedWhaleAccount)
      .approve(apeCoinVault.getAddress(), ethers.MaxUint256);

    await apeCoinVault
      .connect(impersonatedWhaleAccount)
      .deposit(
        "50000000000000000000000",
        impersonatedWhaleAccount.getAddress()
      );

    await time.increase(3600);

    const apeCoinStakeInfoBeforeHarvest = await apeCoinVault.getApeCoinStake();

    const depositedBlanaceBeforeHarvest = apeCoinStakeInfoBeforeHarvest[2];
    const unclaimedBlanaceBeforeHarvest = apeCoinStakeInfoBeforeHarvest[3];

    expect(depositedBlanaceBeforeHarvest).to.equal("50000000000000000000000");
    expect(unclaimedBlanaceBeforeHarvest).to.equal("990798107800250000");

    await expect(apeCoinVault.connect(accounts[0]).harvestApeCoinRewards())
      .to.emit(apeCoinVault, "HarvestApeCoinRewards")
      .withArgs("990798107800250000", "49539905390012500");

    const apeCoinStakeInfoAfterHarvest = await apeCoinVault.getApeCoinStake();

    const depositedBlanaceAfterHarvest = apeCoinStakeInfoAfterHarvest[2];
    const unclaimedBlanaceAfterHarvest = apeCoinStakeInfoAfterHarvest[3];

    expect(depositedBlanaceAfterHarvest).to.equal("50000000000000000000000");
    expect(unclaimedBlanaceAfterHarvest).to.equal("0");

    const feeReceiverBalance = await apeCoin.balanceOf(
      accounts[0].getAddress()
    );

    expect(feeReceiverBalance).to.equal("49539905390012500");

    const apeCoinVaultBalance = await apeCoin.balanceOf(
      apeCoinVault.getAddress()
    );

    expect(apeCoinVaultBalance).to.equal("941258202410237500");
  });

  it("only owner should be able to update admin fee", async () => {
    const { apeCoinVault, impersonatedWhaleAccount } = await loadFixture(
      deployedContracts
    );
    const accounts = await ethers.getSigners();

    await expect(
      apeCoinVault.connect(impersonatedWhaleAccount).updateFee("600")
    )
      .to.be.revertedWithCustomError(apeCoinVault, "OwnableUnauthorizedAccount")
      .withArgs(await impersonatedWhaleAccount.getAddress());

    await expect(apeCoinVault.connect(accounts[0]).updateFee("600"))
      .to.emit(apeCoinVault, "FeeUpdated")
      .withArgs("600");
  });

  it("owner should not be able to update the feeBps with fee more than 10%", async () => {
    const { apeCoinVault } = await loadFixture(deployedContracts);
    const accounts = await ethers.getSigners();

    await expect(apeCoinVault.connect(accounts[0]).updateFee("1001"))
      .to.be.revertedWithCustomError(apeCoinVault, "FeeTooHigh")
      .withArgs("1001");
  });
}).timeout(72000);
