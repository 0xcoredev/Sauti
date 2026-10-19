# Sauti

> Voice-powered MUSD remittances on Mezo.
> Built for the Mezo Buildathon.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue.svg)](https://soliditylang.org/)
[![Mezo](https://img.shields.io/badge/Mezo-Bitcoin%20L2-e84142.svg)](https://mezo.org)

**Sauti** (Swahili for *"voice"*) transforms the way people send Bitcoin-backed
stablecoins across borders. Instead of typing wallet addresses, just say:
*"Send 50 MUSD to mama.family.eth"* — and it's done.

Sauti integrates **MUSD** (Mezo's Bitcoin-backed stablecoin) as the settlement
asset for voice-driven remittances, and **MEZO** as the reward token that
bootstraps adoption: every MUSD send accrues MEZO rewards to the sender.

---

## Why Mezo

Mezo is the Bitcoin finance app that lets people live off their Bitcoin without
selling it. MUSD is its native stablecoin, 100% backed by Bitcoin reserves.

Sauti extends MUSD's utility by making it the default settlement asset for a
voice-first remittance flow aimed at smartphone-first markets — starting with
Africa's $50B remittance corridor. Voice commands resolve to ENS names or
contact aliases, the frontend parses intent, and the on-chain contract
executes the MUSD transfer and accrues MEZO rewards.

### Where Mezo's capabilities shape the design

| Mezo capability | How Sauti uses it |
|---|---|
| **MUSD stablecoin** | Settlement asset for every voice-initiated remittance. |
| **MEZO token** | Reward token accrued to senders (configurable bps), claimable on-chain. |
| **EVM compatibility** | Solidity 0.8.28 contracts deploy with Hardhat on Mezo testnet (chain 31611). |
| **BTC as gas** | Native BTC pays for gas — no wrapped ETH needed. |
| **Mezo Passport (optional)** | RainbowKit-based wallet connection supporting EVM + Bitcoin wallets. |
| **Testnet faucet** | Used to fund developer wallets during Wave 1. |

### Track alignment

Sauti submits to **Track 2: Access and Distribution for MUSD/MEZO** — reducing
friction for users interacting with Mezo's ecosystem by meeting them where they
already are: their voice.

---

## Architecture

```
sauti/
├── packages/
│   ├── hardhat/                    # Solidity contracts + tests
│   │   ├── contracts/
│   │   │   ├── SautiRemittance.sol # Core MUSD remittance + MEZO rewards
│   │   │   └── test/
│   │   │       └── MockERC20.sol   # Mock tokens for local testing
│   │   ├── scripts/
│   │   │   ├── deploy.ts           # Deploy to Mezo testnet
│   │   │   └── deploy-mocks.ts     # Deploy mock MUSD/MEZO for local
│   │   ├── test/
│   │   │   └── SautiRemittance.test.ts
│   │   └── hardhat.config.ts       # Mezo testnet (chain 31611)
│   └── nextjs/                     # Voice-first frontend
│       ├── app/                    # Next.js 15 App Router
│       ├── components/
│       │   └── VoiceComposer.tsx   # Voice input + intent preview
│       └── lib/
│           ├── chains.ts           # Mezo testnet/mainnet chain defs
│           ├── wagmi.ts            # Wagmi config
│           ├── contracts.ts        # SautiRemittance ABI + addresses
│           └── voiceParser.ts      # Natural-language → remittance intent
├── package.json
├── LICENSE
└── README.md
```

---

## Smart contract: `SautiRemittance.sol`

### Core function

```solidity
function sendMusd(address recipient, uint256 amount, string calldata memo) external
```

- Caller approves the contract to spend `amount` of MUSD (standard ERC-20 `approve`).
- Contract calls `transferFrom` to move MUSD directly from sender to recipient.
- Accrues MEZO reward to sender at `rewardBps` (default 1% = 100 bps).
- Emits `RemittanceSent(sender, recipient, amount, memo)` + `RewardAccrued(sender, reward)`.

### Reward claim

```solidity
function claimRewards() external
```

- Sender claims accrued MEZO rewards in one transaction.
- Emits `RewardClaimed(sender, amount)`.

### Public metrics

```solidity
function totalMusdSent() public view returns (uint256)
function totalRemittances() public view returns (uint256)
function totalRewardsClaimed() public view returns (uint256)
```

These counters are public and queryable, providing transparent traction metrics.

### Owner functions

- `setRewardBps(uint256)` — adjust reward rate (max 10%).
- `verifyRecipient(address, bool)` — mark recipients as verified.
- `transferOwnership(address)` — standard ownership transfer.
- `withdrawRewardsPool(address, uint256)` — recover unallocated MEZO.

---

## Setup

### Prerequisites

- Node.js >= 20.18.3 and npm or yarn
- A browser wallet (MetaMask, etc.) configured for Mezo Testnet
- Testnet BTC from the [Mezo Faucet](https://faucet.test.mezo.org/)

### Install

```bash
git clone https://github.com/0xcoredev/Sauti.git
cd Sauti
yarn install
```

### Configure environment

```bash
cp packages/hardhat/.env.example packages/hardhat/.env
# Edit .env with your Mezo testnet private key and token addresses

cp packages/nextjs/.env.example packages/nextjs/.env.local
# Edit .env.local with contract addresses after deployment
```

### Compile contracts

```bash
yarn compile
```

### Run tests

```bash
yarn test
```

The test suite covers deployment, MUSD transfers, MEZO reward accrual and
claim, owner functions, access control, and the full send→accrue→claim lifecycle.

### Deploy mocks locally

For local Hardhat testing without Mezo testnet:

```bash
yarn deploy:mocks
```

This deploys `MockERC20` tokens for MUSD and MEZO, mints test balances, deploys
`SautiRemittance`, and funds the rewards pool.

### Deploy to Mezo testnet

```bash
# Set MUSD_TOKEN_ADDRESS and MEZO_TOKEN_ADDRESS in packages/hardhat/.env
yarn deploy:mezo
```

### Run the frontend

```bash
yarn dev
```

Open `http://localhost:3000`. The voice composer uses the Web Speech API
(requires Chrome or Edge).

---

## How judges can evaluate

1. **Compile** — `yarn compile` must succeed.
2. **Tests** — `yarn test` must pass. The suite covers all core functions.
3. **Deploy** — `yarn deploy:mezo` deploys to Mezo testnet (chain 31611).
4. **Frontend** — `yarn dev` starts the voice composer. Tap the microphone and
   say *"send 50 musd to 0x1234..."*.
5. **MUSD integration** — `SautiRemittance.sol` calls `transferFrom` on the MUSD
   ERC-20 contract. This is real MUSD movement, not a mock.
6. **MEZO integration** — `claimRewards` transfers MEZO from the contract's
   rewards pool to the sender. This is real MEZO distribution.

---

## Roadmap

### Wave 1 (this submission)

- ✅ `SautiRemittance.sol` — MUSD transfer + MEZO rewards
- ✅ Hardhat config for Mezo testnet (chain 31611, BTC gas)
- ✅ Solidity tests covering lifecycle and access control
- ✅ Next.js frontend with voice composer (Web Speech API)
- ✅ Voice parser supporting English + Swahili keywords (`send`, `tuma`)
- ✅ ENS resolution scaffold
- ✅ MockERC20 for local testing

### Wave 2 (next)

- Deploy to Mezo testnet with official MUSD/MEZO addresses
- Mezo Passport integration for native Bitcoin wallet support
- ENS resolution end-to-end (resolve `mama.family.eth` → address on-chain)
- Contact book + recipient aliases (resolve "mama" → saved address)
- Mobile-responsive UI + PWA
- Multi-language voice (Swahili, Hausa, Yoruba, Twi)
- Whisper fallback for accented speech
- Voice receipt storage on IPFS/Filecoin
- Production deploy + mainnet readiness

### Beyond Wave 2

- Cross-chain MUSD bridging (Base, BNB Chain)
- Recurring voice remittances ("send 50 musd to mama every Monday")
- Merchant payments via voice
- Integration with Mezo borrow positions (borrow BTC → mint MUSD → send by voice)
- DAO governance for reward rate adjustments

---

## License

MIT License. See [LICENSE](./LICENSE).

## Acknowledgements

- Built on [Mezo](https://mezo.org) — the Bitcoin finance app.
- MUSD and MEZO are native assets of the Mezo ecosystem.
- Voice interface uses the Web Speech API.
- Wallet connectivity via [Wagmi](https://wagmi.sh) + [RainbowKit](https://rainbowkit.com).
