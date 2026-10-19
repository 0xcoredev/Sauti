"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { parseEther, formatEther, isAddress, type Address } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseVoiceCommand, RemittanceIntent } from "@/lib/voiceParser";
import {
  SAUTI_CONTRACT_ADDRESS,
  SAUTI_ABI,
  MUSD_TOKEN_ADDRESS,
  ERC20_ABI,
} from "@/lib/contracts";
import { mezoTestnet } from "@/lib/chains";

export function VoiceComposer() {
  const { address, isConnected } = useAccount();
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [intent, setIntent] = useState<RemittanceIntent | null>(null);
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // Read total metrics
  const { data: totalSent } = useReadContract({
    address: SAUTI_CONTRACT_ADDRESS,
    abi: SAUTI_ABI,
    functionName: "totalMusdSent",
  });
  const { data: totalRemittances } = useReadContract({
    address: SAUTI_CONTRACT_ADDRESS,
    abi: SAUTI_ABI,
    functionName: "totalRemittances",
  });
  const { data: rewardsOwed } = useReadContract({
    address: SAUTI_CONTRACT_ADDRESS,
    abi: SAUTI_ABI,
    functionName: "rewardsOwedFor",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  const { writeContractAsync } = useWriteContract();

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported. Use Chrome or Edge.");
      return;
    }
    if (listening) {
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);
      const parsed = parseVoiceCommand(text);
      setIntent(parsed);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event: any) => {
      console.error("Voice error:", event.error);
      setListening(false);
    };

    setTranscript("");
    setIntent(null);
    setStatus("");
    setTxHash("");
    recognition.start();
    setListening(true);
  };

  // Step 1: Approve MUSD for the Sauti contract to spend
  const approveMusd = async (amountWei: bigint) => {
    if (!address) throw new Error("Wallet not connected");
    setStatus("Approving MUSD...");
    const tx = await writeContractAsync({
      account: address,
      address: MUSD_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [SAUTI_CONTRACT_ADDRESS, amountWei],
      chainId: mezoTestnet.id,
    } as any);
    setTxHash(tx);
    setStatus("MUSD approved. Sending remittance...");
    return tx;
  };

  // Step 2: Call sendMusd on SautiRemittance
  const sendMusd = async (recipient: string, amountWei: bigint, memo: string) => {
    setStatus("Sending MUSD remittance...");
    const tx = await writeContractAsync({
      account: address!,
      address: SAUTI_CONTRACT_ADDRESS,
      abi: SAUTI_ABI,
      functionName: "sendMusd",
      args: [recipient as Address, amountWei, memo],
      chainId: mezoTestnet.id,
    } as any);
    setTxHash(tx);
    setStatus("MUSD sent! MEZO rewards accrued.");
    return tx;
  };

  // Step 3: Claim MEZO rewards
  const claimRewards = async () => {
    if (!address) return;
    setStatus("Claiming MEZO rewards...");
    const tx = await writeContractAsync({
      account: address,
      address: SAUTI_CONTRACT_ADDRESS,
      abi: SAUTI_ABI,
      functionName: "claimRewards",
      chainId: mezoTestnet.id,
    } as any);
    setTxHash(tx);
    setStatus("MEZO rewards claimed!");
  };

  const handleConfirm = async () => {
    if (!intent || !intent.ok || !address) return;
    if (!isAddress(intent.recipient)) {
      setStatus(`Recipient "${intent.recipient}" is not a valid 0x address. ENS resolution is Wave 2.`);
      return;
    }
    try {
      const amountWei = parseEther(intent.amount);
      await approveMusd(amountWei);
      await sendMusd(intent.recipient, amountWei, intent.memo);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.shortMessage || err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-sauti-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Speak your MUSD into motion</h2>
        <p className="text-gray-500 mt-1">
          Try: <em>&quot;Send 50 musd to 0x742d35Cc6634C0532925a3b8D35Cc6634C0532925&quot;</em>
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="bg-sauti-50 rounded-xl p-3">
          <div className="text-xs text-sauti-700 font-semibold">Total MUSD Sent</div>
          <div className="font-bold text-gray-900">
            {totalSent ? formatEther(totalSent) : "0"}
          </div>
        </div>
        <div className="bg-sauti-50 rounded-xl p-3">
          <div className="text-xs text-sauti-700 font-semibold">Remittances</div>
          <div className="font-bold text-gray-900">
            {totalRemittances?.toString() || "0"}
          </div>
        </div>
        <div className="bg-sauti-50 rounded-xl p-3">
          <div className="text-xs text-sauti-700 font-semibold">Your MEZO Owed</div>
          <div className="font-bold text-gray-900">
            {rewardsOwed ? formatEther(rewardsOwed) : "0"}
          </div>
        </div>
      </div>

      {/* Voice button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl transition-all ${
            listening ? "bg-mezo-red animate-pulse" : "bg-sauti-500 hover:bg-sauti-600"
          }`}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          {listening ? "■" : "🎤"}
        </button>
      </div>

      {transcript && (
        <div className="mb-4 p-4 bg-sauti-50 rounded-xl">
          <div className="text-xs uppercase text-sauti-700 font-semibold mb-1">You said</div>
          <div className="text-gray-900 text-lg">&quot;{transcript}&quot;</div>
        </div>
      )}

      {intent && !intent.ok && (
        <div className="mb-4 p-4 bg-red-50 rounded-xl text-red-800 text-sm">
          <strong>Could not parse:</strong> {intent.error}
        </div>
      )}

      {intent && intent.ok && (
        <div className="mb-4 p-4 bg-green-50 rounded-xl">
          <div className="text-xs uppercase text-green-700 font-semibold mb-2">Parsed intent</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Amount:</div>
            <div className="font-semibold text-gray-900">{intent.amount} MUSD</div>
            <div className="text-gray-500">Recipient:</div>
            <div className="font-semibold text-gray-900 truncate">{intent.recipient}</div>
          </div>
          {!isConnected ? (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
              Connect your wallet to send.
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              className="mt-4 w-full bg-sauti-500 hover:bg-sauti-600 text-white font-semibold py-3 rounded-xl transition"
            >
              Confirm &amp; Send MUSD
            </button>
          )}
        </div>
      )}

      {/* Rewards claim */}
      {isConnected && rewardsOwed && rewardsOwed > 0n && (
        <button
          onClick={claimRewards}
          className="mt-4 w-full bg-mezo-red hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Claim {formatEther(rewardsOwed)} MEZO Rewards
        </button>
      )}

      {/* Status */}
      {status && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-blue-900 text-sm">{status}</div>
      )}
      {txHash && (
        <div className="mt-2 text-xs text-gray-500 break-all">
          Tx: <code>{txHash}</code>
        </div>
      )}

      {!transcript && !listening && (
        <div className="text-center text-gray-400 text-sm">
          Tap the microphone and speak naturally.
        </div>
      )}
    </div>
  );
}
