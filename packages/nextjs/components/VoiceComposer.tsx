"use client";

import { useState, useEffect, useRef } from "react";
import { parseVoiceCommand, RemittanceIntent } from "@/lib/voiceParser";

export function VoiceComposer() {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [intent, setIntent] = useState<RemittanceIntent | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
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

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript("");
      setIntent(null);
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-sauti-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Speak your MUSD into motion</h2>
        <p className="text-gray-500 mt-1">
          Try: <em>&quot;Send 50 musd to mama.family.eth&quot;</em>
        </p>
      </div>

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
            <div className="font-semibold text-gray-900">{intent.recipient}</div>
          </div>
          <button className="mt-4 w-full bg-sauti-500 hover:bg-sauti-600 text-white font-semibold py-3 rounded-xl transition">
            Confirm &amp; Send MUSD
          </button>
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
