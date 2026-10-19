// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract SautiRemittance {
    // ============ State ============
    IERC20 public immutable musdToken;
    IERC20 public immutable mezoToken;

    address public owner;

    // MEZO reward per MUSD sent, in basis points (100 = 1%, 1000 = 10%)
    uint256 public rewardBps;

    // Public traction metrics (readable by anyone)
    uint256 public totalMusdSent;
    uint256 public totalRemittances;
    uint256 public totalRewardsClaimed;

    // Optional recipient verification (for trust scoring)
    mapping(address => bool) public verifiedRecipients;

    // MEZO rewards accrued to each sender
    mapping(address => uint256) public rewardsOwed;

    // ============ Events ============
    event RemittanceSent(address indexed sender, address indexed recipient, uint256 amount, string memo);
    event RewardAccrued(address indexed sender, uint256 rewardAmount);
    event RewardClaimed(address indexed sender, uint256 amount);
    event RecipientVerified(address indexed recipient, bool status);
    event RewardBpsUpdated(uint256 oldBps, uint256 newBps);

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Sauti: not owner");
        _;
    }

    // ============ Constructor ============
    constructor(address _musd, address _mezo, uint256 _rewardBps) {
        require(_musd != address(0), "Sauti: MUSD zero address");
        require(_mezo != address(0), "Sauti: MEZO zero address");
        require(_rewardBps <= 1000, "Sauti: reward too high");
        musdToken = IERC20(_musd);
        mezoToken = IERC20(_mezo);
        rewardBps = _rewardBps;
        owner = msg.sender;
    }

    // ============ Core: Send MUSD ============
    // Caller must approve this contract to spend `amount` of MUSD first.
    // The voice parsing happens off-chain (frontend); this circuit executes
    // the parsed intent: send `amount` MUSD to `recipient` with a `memo`.
    function sendMusd(address recipient, uint256 amount, string calldata memo) external {
        require(recipient != address(0), "Sauti: recipient zero address");
        require(amount > 0, "Sauti: amount must be > 0");

        uint256 balBefore = musdToken.balanceOf(address(this));
        require(musdToken.transferFrom(msg.sender, recipient, amount), "Sauti: MUSD transfer failed");
        // Sanity check: transferFrom moved tokens correctly.
        require(musdToken.balanceOf(address(this)) == balBefore, "Sauti: balance mismatch");

        totalMusdSent += amount;
        totalRemittances += 1;

        // Accrue MEZO reward to sender (bootstrap adoption).
        uint256 reward = (amount * rewardBps) / 10000;
        if (reward > 0) {
            rewardsOwed[msg.sender] += reward;
            emit RewardAccrued(msg.sender, reward);
        }

        emit RemittanceSent(msg.sender, recipient, amount, memo);
    }

    // ============ Claim MEZO Rewards ============
    function claimRewards() external {
        uint256 owed = rewardsOwed[msg.sender];
        require(owed > 0, "Sauti: no rewards owed");

        rewardsOwed[msg.sender] = 0;
        require(mezoToken.transfer(msg.sender, owed), "Sauti: MEZO transfer failed");
        totalRewardsClaimed += owed;

        emit RewardClaimed(msg.sender, owed);
    }

    // ============ Read-only helpers ============
    function rewardsOwedFor(address user) external view returns (uint256) {
        return rewardsOwed[user];
    }

    function isRecipientVerified(address recipient) external view returns (bool) {
        return verifiedRecipients[recipient];
    }

    // ============ Owner functions ============
    function setRewardBps(uint256 _bps) external onlyOwner {
        require(_bps <= 1000, "Sauti: reward too high");
        uint256 old = rewardBps;
        rewardBps = _bps;
        emit RewardBpsUpdated(old, _bps);
    }

    function verifyRecipient(address recipient, bool status) external onlyOwner {
        verifiedRecipients[recipient] = status;
        emit RecipientVerified(recipient, status);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Sauti: new owner zero");
        owner = newOwner;
    }

    // Owner can top up the MEZO rewards pool by simply transferring MEZO
    // to this contract. withdrawRewardsPool lets owner recover unallocated
    // MEZO if the program ends.
    function withdrawRewardsPool(address to, uint256 amount) external onlyOwner {
        require(mezoToken.transfer(to, amount), "Sauti: withdraw failed");
    }
}
