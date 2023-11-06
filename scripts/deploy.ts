import { ethers } from "hardhat";

async function main() {
  const apeCoinVault = await ethers.deployContract("ApeCoinVault", [
    process.env.APE_COIN_ADDRESS,
    process.env.APE_COIN_STAKING_ADDRESS,
    process.env.APE_COIN_VAULT_FEE_BPS,
  ]);

  await apeCoinVault.waitForDeployment();

  console.log(
    `ApeCoinVault deployed to: https://etherscan.io/address/${await apeCoinVault.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
