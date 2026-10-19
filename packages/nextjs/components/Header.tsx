"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-sauti-100 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔊</span>
        <span className="font-bold text-xl text-gray-900">Sauti</span>
        <span className="text-xs text-gray-400 ml-2 hidden sm:inline">
          Voice MUSD on Mezo
        </span>
      </div>
      <ConnectButton />
    </header>
  );
}
