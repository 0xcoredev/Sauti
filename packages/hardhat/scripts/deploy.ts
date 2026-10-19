import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying SautiRemittance with account:", deployer.address);

  // On Mezo testnet, replace these with the official MUSD and MEZO token
  // addresses from the Mezo docs (mezo-org/musd repo). For local Hardhat
  // testing, deploy the MockERC20 first and pass their addresses here.
  const musdAddress = process.env.MUSD_TOKEN_ADDRESS || "";
  const mezoAddress = process.env.MEZO_TOKEN_ADDRESS || "";
  const rewardBps = process.env.SAUTI_REWARD_BPS || "100"; // 1% default

  if (!musdAddress || !mezoAddress) {
    console.warn(
      "MUSD_TOKEN_ADDRESS and MEZO_TOKEN_ADDRESS not set. " +
        "For local testing, run: npx hardhat run scripts/deploy-mocks.ts --network hardhat"
    );
    return;
  }

  const SautiRemittance = await ethers.getContractFactory("SautiRemittance");
  const sauti = await SautiRemittance.deploy(musdAddress, mezoAddress, rewardBps);
  await sauti.waitForDeployment();

  const address = await sauti.getAddress();
  console.log("SautiRemittance deployed to:", address);
  console.log("  MUSD token:", musdAddress);
  console.log("  MEZO token:", mezoAddress);
  console.log("  rewardBps:", rewardBps);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
