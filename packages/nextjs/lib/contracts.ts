// Sauti contract addresses — update after deployment.
// On Mezo testnet, set these to the deployed SautiRemittance address and the
// official MUSD / MEZO token addresses from the Mezo docs.
export const SAUTI_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_SAUTI_CONTRACT_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000";

export const MUSD_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_MUSD_TOKEN_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000";

export const MEZO_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_MEZO_TOKEN_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000";

// SautiRemittance ABI (minimal, for frontend use)
export const SAUTI_ABI = [
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "memo", type: "string" },
    ],
    name: "sendMusd",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "rewardsOwedFor",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMusdSent",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRemittances",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRewardsClaimed",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Minimal ERC-20 ABI
export const ERC20_ABI = [
  {
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
