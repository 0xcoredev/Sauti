// Sauti voice command parser.
// Translates a natural-language voice command into a structured remittance
// intent that the SautiRemittance contract can execute.
//
// Examples handled:
//   "send 50 musd to 0xabcd..."
//   "send 100 musd to mama.family.eth"
//   "send 20 musd to alice"
//   "tuma 50 musd kwa mama"   (Swahili: "send 50 musd to mama")

export interface RemittanceIntent {
  amount: string; // in MUSD, human-readable (e.g. "50")
  recipient: string; // ENS name or 0x address or contact alias
  memo: string; // original transcript for the on-chain memo
  ok: boolean;
  error?: string;
}

const SEND_KEYWORDS = /\b(send|tuma|transfer|sends?|pay)\b/i;
const AMOUNT_PATTERN = /\b(\d+(?:\.\d+)?)\s*(musd|usd|dollars?|cedis?|naira|shillings?)?\b/i;
const RECIPIENT_KEYWORD = /\b(to|kwa|for)\s+/i;
const ADDRESS_PATTERN = /\b(0x[a-fA-F0-9]{40})\b/;
const ENS_PATTERN = /\b([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/i;

export function parseVoiceCommand(transcript: string): RemittanceIntent {
  const text = transcript.trim();
  if (!text) {
    return { amount: "", recipient: "", memo: transcript, ok: false, error: "Empty command" };
  }

  if (!SEND_KEYWORDS.test(text)) {
    return {
      amount: "",
      recipient: "",
      memo: transcript,
      ok: false,
      error: "No send keyword detected (say: send, tuma, transfer, or pay)",
    };
  }

  const amountMatch = text.match(AMOUNT_PATTERN);
  if (!amountMatch) {
    return {
      amount: "",
      recipient: "",
      memo: transcript,
      ok: false,
      error: "No amount detected (say: send 50 musd)",
    };
  }
  const amount = amountMatch[1];

  // Try 0x address first
  let recipient = "";
  const addressMatch = text.match(ADDRESS_PATTERN);
  if (addressMatch) {
    recipient = addressMatch[1];
  } else {
    // Try ENS / alias after "to" or "kwa"
    const toIdx = text.search(RECIPIENT_KEYWORD);
    if (toIdx >= 0) {
      const rest = text.slice(toIdx).replace(RECIPIENT_KEYWORD, "").trim();
      const ensMatch = rest.match(ENS_PATTERN);
      if (ensMatch) {
        recipient = ensMatch[1];
      } else {
        // Take the first word as an alias (frontend resolves via contact book)
        const firstWord = rest.split(/\s+/)[0]?.replace(/[^\w.-]/g, "");
        if (firstWord) recipient = firstWord;
      }
    }
  }

  if (!recipient) {
    return {
      amount,
      recipient: "",
      memo: transcript,
      ok: false,
      error: "No recipient detected (say: send 50 musd to mama.family.eth)",
    };
  }

  return { amount, recipient, memo: transcript, ok: true };
}
