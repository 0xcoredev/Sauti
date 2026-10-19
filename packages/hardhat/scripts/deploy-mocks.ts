import { ethers } from "hardhat";

// Deploy mock ERC-20 tokens for local Hardhat testing.
// On Mezo testnet, use the official MUSD and MEZO contract addresses instead.
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying mocks with account:", deployer.address);

  const MockERC20 = await ethers.getContractFactory("MockERC20");

  const musd = await MockERC20.deploy("Mezo USD", "MUSD", 18);
  await musd.waitForDeployment();
  const musdAddr = await musd.getAddress();
  console.log("MockMUSD deployed to:", musdAddr);

  const mezo = await MockERC20.deploy("Mezo Token", "MEZO", 18);
  await mezo.waitForDeployment();
  const mezoAddr = await mezo.getAddress();
  console.log("MockMEZO deployed to:", mezoAddr);

  // Mint test balances
  const mintAmount = ethers.parseEther("1000000");
  await musd.mint(deployer.address, mintAmount);
  await mezo.mint(deployer.address, mintAmount);
  console.log("Minted 1,000,000 MUSD and 1,000,000 MEZO to", deployer.address);

  const SautiRemittance = await ethers.getContractFactory("SautiRemittance");
  const sauti = await SautiRemittance.deploy(musdAddr, mezoAddr, 100); // 1% reward
  await sauti.waitForDeployment();
  console.log("SautiRemittance deployed to:", await sauti.getAddress());

  // Fund the rewards pool
  const rewardPool = ethers.parseEther("100000");
  await mezo.transfer(await sauti.getAddress(), rewardPool);
  console.log("Funded SautiRewards pool with 100,000 MEZO");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
