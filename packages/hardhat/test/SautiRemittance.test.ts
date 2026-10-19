import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { SautiRemittance, MockERC20 } from "../typechain-types";

describe("SautiRemittance", () => {
  let musd: MockERC20;
  let mezo: MockERC20;
  let sauti: SautiRemittance;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;
  let other: SignerWithAddress;

  const REWARD_BPS = 100; // 1%
  const SEND_AMOUNT = ethers.parseEther("100");
  const EXPECTED_REWARD = ethers.parseEther("1"); // 1% of 100

  beforeEach(async () => {
    [owner, sender, recipient, other] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    musd = await MockERC20.deploy("Mezo USD", "MUSD", 18);
    mezo = await MockERC20.deploy("Mezo Token", "MEZO", 18);

    const SautiRemittance = await ethers.getContractFactory("SautiRemittance");
    sauti = await SautiRemittance.deploy(
      await musd.getAddress(),
      await mezo.getAddress(),
      REWARD_BPS
    );

    // Mint MUSD to sender
    await musd.mint(sender.address, ethers.parseEther("10000"));

    // Mint MEZO to owner and fund the rewards pool
    await mezo.mint(owner.address, ethers.parseEther("1000000"));
    await mezo.connect(owner).transfer(await sauti.getAddress(), ethers.parseEther("100000"));

    // Sender approves Sauti contract to spend MUSD
    await musd.connect(sender).approve(await sauti.getAddress(), ethers.parseEther("10000"));
  });

  describe("Deployment", () => {
    it("stores correct MUSD and MEZO addresses", async () => {
      expect(await sauti.musdToken()).to.equal(await musd.getAddress());
      expect(await sauti.mezoToken()).to.equal(await mezo.getAddress());
    });

    it("sets owner to deployer", async () => {
      expect(await sauti.owner()).to.equal(owner.address);
    });

    it("sets rewardBps correctly", async () => {
      expect(await sauti.rewardBps()).to.equal(REWARD_BPS);
    });

    it("rejects zero MUSD address", async () => {
      const SautiRemittance = await ethers.getContractFactory("SautiRemittance");
      await expect(
        SautiRemittance.deploy(ethers.ZeroAddress, await mezo.getAddress(), REWARD_BPS)
      ).to.be.revertedWith("Sauti: MUSD zero address");
    });

    it("rejects zero MEZO address", async () => {
      const SautiRemittance = await ethers.getContractFactory("SautiRemittance");
      await expect(
        SautiRemittance.deploy(await musd.getAddress(), ethers.ZeroAddress, REWARD_BPS)
      ).to.be.revertedWith("Sauti: MEZO zero address");
    });

    it("rejects reward bps > 1000 (10%)", async () => {
      const SautiRemittance = await ethers.getContractFactory("SautiRemittance");
      await expect(
        SautiRemittance.deploy(await musd.getAddress(), await mezo.getAddress(), 1001)
      ).to.be.revertedWith("Sauti: reward too high");
    });
  });

  describe("sendMusd", () => {
    it("transfers MUSD from sender to recipient", async () => {
      const recipientBefore = await musd.balanceOf(recipient.address);
      await sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "voice: send 100 musd");
      expect(await musd.balanceOf(recipient.address)).to.equal(recipientBefore + SEND_AMOUNT);
    });

    it("increments totalMusdSent and totalRemittances", async () => {
      await sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "memo");
      expect(await sauti.totalMusdSent()).to.equal(SEND_AMOUNT);
      expect(await sauti.totalRemittances()).to.equal(1);

      await sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "memo2");
      expect(await sauti.totalMusdSent()).to.equal(SEND_AMOUNT * 2n);
      expect(await sauti.totalRemittances()).to.equal(2);
    });

    it("accrues MEZO reward to sender", async () => {
      await sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "memo");
      expect(await sauti.rewardsOwed(sender.address)).to.equal(EXPECTED_REWARD);
    });

    it("emits RemittanceSent event", async () => {
      await expect(sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "voice memo"))
        .to.emit(sauti, "RemittanceSent")
        .withArgs(sender.address, recipient.address, SEND_AMOUNT, "voice memo");
    });

    it("emits RewardAccrued event", async () => {
      await expect(sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "memo"))
        .to.emit(sauti, "RewardAccrued")
        .withArgs(sender.address, EXPECTED_REWARD);
    });

    it("rejects zero recipient", async () => {
      await expect(
        sauti.connect(sender).sendMusd(ethers.ZeroAddress, SEND_AMOUNT, "memo")
      ).to.be.revertedWith("Sauti: recipient zero address");
    });

    it("rejects zero amount", async () => {
      await expect(
        sauti.connect(sender).sendMusd(recipient.address, 0, "memo")
      ).to.be.revertedWith("Sauti: amount must be > 0");
    });

    it("requires prior approval", async () => {
      await musd.connect(sender).approve(await sauti.getAddress(), 0);
      await expect(
        sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "memo")
      ).to.be.revertedWithCustomError;
    });
  });

  describe("claimRewards", () => {
    beforeEach(async () => {
      await sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "memo");
    });

    it("transfers accrued MEZO to sender", async () => {
      const mezoBefore = await mezo.balanceOf(sender.address);
      await sauti.connect(sender).claimRewards();
      expect(await mezo.balanceOf(sender.address)).to.equal(mezoBefore + EXPECTED_REWARD);
    });

    it("zeros out rewardsOwed after claim", async () => {
      await sauti.connect(sender).claimRewards();
      expect(await sauti.rewardsOwed(sender.address)).to.equal(0);
    });

    it("increments totalRewardsClaimed", async () => {
      await sauti.connect(sender).claimRewards();
      expect(await sauti.totalRewardsClaimed()).to.equal(EXPECTED_REWARD);
    });

    it("emits RewardClaimed event", async () => {
      await expect(sauti.connect(sender).claimRewards())
        .to.emit(sauti, "RewardClaimed")
        .withArgs(sender.address, EXPECTED_REWARD);
    });

    it("rejects claim with no rewards owed", async () => {
      await expect(sauti.connect(other).claimRewards()).to.be.revertedWith(
        "Sauti: no rewards owed"
      );
    });
  });

  describe("Owner functions", () => {
    it("owner can set reward bps", async () => {
      await sauti.connect(owner).setRewardBps(200); // 2%
      expect(await sauti.rewardBps()).to.equal(200);
    });

    it("non-owner cannot set reward bps", async () => {
      await expect(sauti.connect(other).setRewardBps(200)).to.be.revertedWith(
        "Sauti: not owner"
      );
    });

    it("rejects reward bps > 1000", async () => {
      await expect(sauti.connect(owner).setRewardBps(1001)).to.be.revertedWith(
        "Sauti: reward too high"
      );
    });

    it("owner can verify recipient", async () => {
      await sauti.connect(owner).verifyRecipient(recipient.address, true);
      expect(await sauti.verifiedRecipients(recipient.address)).to.equal(true);
    });

    it("owner can transfer ownership", async () => {
      await sauti.connect(owner).transferOwnership(other.address);
      expect(await sauti.owner()).to.equal(other.address);
    });

    it("owner can withdraw rewards pool", async () => {
      const amount = ethers.parseEther("50000");
      const ownerBefore = await mezo.balanceOf(owner.address);
      await sauti.connect(owner).withdrawRewardsPool(owner.address, amount);
      expect(await mezo.balanceOf(owner.address)).to.equal(ownerBefore + amount);
    });
  });

  describe("Full lifecycle", () => {
    it("send -> accrue -> claim", async () => {
      // 1. Send MUSD
      await sauti.connect(sender).sendMusd(recipient.address, SEND_AMOUNT, "voice: send 100 musd");
      expect(await sauti.rewardsOwed(sender.address)).to.equal(EXPECTED_REWARD);

      // 2. Claim MEZO
      const mezoBefore = await mezo.balanceOf(sender.address);
      await sauti.connect(sender).claimRewards();
      expect(await mezo.balanceOf(sender.address)).to.equal(mezoBefore + EXPECTED_REWARD);

      // 3. Verify metrics
      expect(await sauti.totalMusdSent()).to.equal(SEND_AMOUNT);
      expect(await sauti.totalRemittances()).to.equal(1);
      expect(await sauti.totalRewardsClaimed()).to.equal(EXPECTED_REWARD);
    });
  });
});
