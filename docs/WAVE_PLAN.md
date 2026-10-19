# Sauti — Wave Plan

> Mezo Buildathon: Wave 1 (Oct 16–26), Wave 2 (Nov 2–15), Winner Announcement (Nov 23)

## Wave 1 — What's Done (Oct 16–26, 2026)

### Smart contract ✅

- **`SautiRemittance.sol`** — Solidity 0.8.28 contract on Mezo testnet (chain 31611)
  - `sendMusd(recipient, amount, memo)` — transfers MUSD from sender to recipient via `transferFrom`
  - `claimRewards()` — sends accrued MEZO rewards to sender
  - `setRewardBps(bps)` — owner adjusts reward rate (default 1% = 100 bps)
  - `verifyRecipient(addr, status)` — owner marks recipients as verified
  - `withdrawRewardsPool(to, amount)` — owner recovers unallocated MEZO
  - Public metrics: `totalMusdSent`, `totalRemittances`, `totalRewardsClaimed`
  - Events: `RemittanceSent`, `RewardAccrued`, `RewardClaimed`, `RecipientVerified`, `RewardBpsUpdated`
- **`MockERC20.sol`** — for local Hardhat testing (mock MUSD + MEZO)
- **26 Solidity tests passing** — deployment, transfers, rewards, access control, lifecycle
- **Hardhat config** — Mezo testnet (chain 31611, BTC gas, Solidity 0.8.28, london EVM, optimizer 200)
- **Deploy scripts** — `deploy.ts` (Mezo testnet), `deploy-mocks.ts` (local)

### Frontend ✅

- **Next.js 15** App Router with React 19, TypeScript, Tailwind CSS
- **`VoiceComposer.tsx`** — microphone button, Web Speech API integration, intent preview, confirm button
- **`voiceParser.ts`** — natural-language parser supporting:
  - English: "send 50 musd to 0x1234..."
  - English: "send 100 musd to mama.family.eth"
  - Swahili: "tuma 20 musd kwa alice"
- **`Providers.tsx`** — Wagmi + RainbowKit config for Mezo testnet
- **`Header.tsx`** — Sauti branding + ConnectButton
- **On-chain contract calls wired**: `approve` → `sendMusd` → `claimRewards`
- **Live metrics display**: totalMUSD sent, total remittances, user's MEZO owed
- **Error boundaries**: `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`
- **Production build passes**: `npx next build` succeeds

### Repository ✅

- **4 commits** on `main`, pushed to `github.com/0xcoredev/Sauti`
- MIT LICENSE
- README with Mezo integration narrative + setup guide
- `.env.example` files for hardhat + nextjs
- Track 2 submission: Access and Distribution for MUSD/MEZO

### Wave 1 — What's NOT done (honest gaps)

- **Microphone not working in browser** — Web Speech API needs HTTPS or localhost; permissions flow not debugged
- **Not deployed to Mezo testnet** — needs official MUSD/MEZO addresses + testnet BTC from faucet
- **ENS resolution not wired** — parser extracts ENS names but frontend doesn't resolve them to addresses yet
- **No demo video recorded** — required for AKINDO submission
- **No slide deck** — required for AKINDO submission

### Wave 1 — Remaining before Oct 26 deadline

1. **Record demo video** (3-5 min): show contract compile, tests pass, frontend UI, explain MUSD/MEZO integration
2. **Write slide deck** (5-8 slides): problem, Mezo fit, contract design, frontend, Wave 2 roadmap
3. **Submit on AKINDO** — Track 2, paste narrative

---

## Wave 2 — Plan (Nov 2–15, 2026)

**Goal: ship a working end-to-end product deployed on Mezo testnet with real MUSD transfers.**

### 1. Fix microphone (Day 1-2)

- Debug Web Speech API permissions flow
- Ensure HTTPS or localhost works
- Add fallback: text input if voice fails
- Add visual feedback while listening (waveform animation)
- Test on Chrome, Edge, mobile Chrome

### 2. Deploy to Mezo testnet (Day 2-3)

- Get testnet BTC from https://faucet.test.mezo.org/
- Find official MUSD/MEZO addresses from `mezo-org/musd` repo
- Deploy `SautiRemittance` to Mezo testnet
- Fund rewards pool with MEZO
- Set contract addresses in frontend `.env.local`
- Verify contract on explorer.test.mezo.org

### 3. ENS resolution (Day 3-4)

- Wire up `ensResolve(name)` via viem's `getEnsAddress`
- Cache resolved addresses in localStorage
- Show resolved address in intent preview before confirmation
- Fallback: if ENS fails, show "could not resolve" error

### 4. Contact book (Day 4-5)

- Add `contacts` table in localStorage: `{ alias: "mama", address: "0x1234..." }`
- Voice parser resolves aliases: "send 50 musd to mama" → look up "mama" → address
- UI to add/edit/delete contacts
- Import contacts from wallet

### 5. Mezo Passport integration (Day 5-6)

- Replace RainbowKit with `@mezo-org/passport`
- Support native Bitcoin wallets (Xverse, Unisat) alongside EVM wallets
- Test wallet connection on Mezo testnet

### 6. Mobile-responsive UI + PWA (Day 6-7)

- Responsive layout for phone screens
- Touch-optimized microphone button
- PWA manifest + service worker
- Installable on Android home screen

### 7. Multi-language voice (Day 7-8)

- Add Swahili, Hausa, Yoruba, Twi language options
- Set `recognition.lang` based on user preference
- Extend parser keywords per language
- Test with accented speech

### 8. Whisper fallback (Day 8-9)

- If Web Speech API fails, record audio via MediaRecorder
- Send to OpenAI Whisper API for transcription
- Parse transcript with existing parser
- Requires `OPENAI_API_KEY` in `.env.local`

### 9. Voice receipt storage (Day 9-10)

- Store voice transcript + tx hash on IPFS via web3.storage or Pinata
- Generate CID as immutable receipt
- Display receipt link in UI after transaction

### 10. Demo video + submission (Day 10-11)

- Record 5-min demo: real MUSD transfer on Mezo testnet via voice
- Show MEZO reward claim
- Show metrics updating live
- Submit on AKINDO with Wave 2 narrative

### Wave 2 deliverables

- Working dApp deployed on Mezo testnet
- Real MUSD transfers via voice command
- ENS + contact book resolution
- Mezo Passport wallet integration
- Mobile-responsive PWA
- Multi-language voice support
- Voice receipts on IPFS
- Demo video + slide deck

---

## Wave 3 — Plan (Beyond Buildathon)

**Goal: scale Sauti into a production-ready cross-chain remittance platform.**

### 1. Cross-chain MUSD bridging

- Deploy SautiRemittance on Base, BNB Chain, Ethereum
- Bridge MUSD across chains via Mezo's bridge infrastructure
- Voice command: "send 50 musd to mama on base"

### 2. Recurring voice remittances

- "Send 50 musd to mama every Monday"
- Store recurring schedule on-chain
- Auto-execute via keeper network (Chainlink Automation or Gelato)
- Cancel anytime via voice: "cancel recurring to mama"

### 3. Merchant payments via voice

- Merchant directory with verified addresses
- "Pay 30 musd to Kojo Supermarket"
- QR code fallback for in-store payments
- Receipt NFT for merchant records

### 4. Mezo borrow integration

- Borrow BTC against collateral on Mezo
- Mint MUSD from borrowed BTC
- Send MUSD via voice immediately
- "Borrow 1000 musd and send 500 to mama"

### 5. DAO governance

- MEZO holders vote on reward rate adjustments
- Propose new supported languages
- Vote on merchant verification thresholds
- On-chain proposal + voting via Sauti governance contract

### 6. Mobile app (Kuira SDK or React Native)

- Native mobile app for iOS and Android
- Push notifications: "Your MUSD arrived"
- Biometric auth (FaceID, fingerprint)
- Offline voice transcription

### 7. Analytics dashboard

- Personal remittance history
- Community metrics: total MUSD sent through Sauti
- MEZO rewards earned over time
- Recipient verification status

### 8. Compliance layer

- Optional KYC for high-volume senders
- Travel rule compliance for large transfers
- Sanctions screening via oracle
- Maintains privacy for low-value remittances

### Wave 3 deliverables

- Cross-chain deployment (Mezo + Base + BNB)
- Recurring remittances
- Merchant payments
- Mezo borrow integration
- DAO governance
- Mobile app
- Analytics dashboard
- Compliance layer

---

## Submission checklist (all Waves)

### Wave 1 (Oct 26)

- [ ] GitHub repo public: `github.com/0xcoredev/Sauti`
- [ ] Compiling Solidity contract ✅
- [ ] Tests passing ✅
- [ ] README with Mezo integration narrative ✅
- [ ] Slide deck
- [ ] Demo video
- [ ] AKINDO submission form

### Wave 2 (Nov 15)

- [ ] All Wave 1 items
- [ ] Deployed on Mezo testnet
- [ ] Real MUSD transfers working
- [ ] Frontend end-to-end functional
- [ ] Mobile-responsive
- [ ] Multi-language support
- [ ] "What changed since Wave 1" narrative

### Wave 3 (beyond)

- [ ] Cross-chain
- [ ] Production mainnet readiness
- [ ] Long-term roadmap credibility

---

## Reward math

| Wave | Pool | Sauti target | Reasoning |
|---|---|---|---|
| Wave 1 | $2,000 MEZO | 15-25% share | Strong contract + frontend, no testnet deploy yet |
| Wave 2 | $5,000 MEZO | 20-30% share | Working dApp on testnet, real MUSD transfers, multi-language |
| **Total** | **$7,000 MEZO** | **~$1,500-$2,100** | Proportional to points earned |

Wave 2 carries the larger pool — shipping a working product there is where the real reward sits.
