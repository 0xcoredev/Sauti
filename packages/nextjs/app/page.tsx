"use client";

import { VoiceComposer } from "@/components/VoiceComposer";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-4xl">🔊</span>
          <h1 className="text-5xl font-bold text-gray-900">Sauti</h1>
        </div>
        <p className="text-xl text-gray-600">
          Voice-powered MUSD remittances on Mezo.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Speak your Bitcoin-backed stablecoin into motion.
        </p>
      </header>

      <VoiceComposer />

      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon="🎤"
          title="Voice-first"
          desc="Say &quot;send 50 musd to mama&quot; — no addresses, no friction."
        />
        <FeatureCard
          icon="₿"
          title="Bitcoin-backed"
          desc="MUSD is 100% backed by Bitcoin reserves. Send value held in BTC."
        />
        <FeatureCard
          icon="⚡"
          title="MEZO rewards"
          desc="Earn MEZO tokens on every MUSD remittance you send."
        />
      </section>

      <footer className="mt-16 text-center text-sm text-gray-400">
        Built for the Mezo Buildathon · Apache 2.0 / MIT
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-sauti-100">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
