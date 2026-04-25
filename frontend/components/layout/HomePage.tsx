"use client";
import { useState } from "react";
import { ArrowRight, Brain, Database, Zap, BarChart3 } from "lucide-react";

interface HomePageProps {
  onStart: () => void;
}

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-ink/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center">
            <Brain size={14} className="text-amber-400" />
          </div>
          <span className="font-display font-700 text-sm text-ink tracking-tight">
            DecideAI
          </span>
        </div>
        <span className="text-xs font-body text-ink/40 bg-ink/5 px-3 py-1 rounded-full">
          Powered by Z.AI GLM
        </span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto w-full">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-display font-600 px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            AI Decision Intelligence for Malaysian SMEs
          </div>

          <h1 className="font-display font-800 text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight mb-6">
            Smarter decisions,
            <br />
            <span className="text-amber-500">not just answers.</span>
          </h1>

          <p className="font-body text-ink/60 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Tell us about your business. We'll build a context profile, retrieve
            real Malaysian market data, and return structured insights — not
            just a chatbot reply.
          </p>

          <button
            onClick={onStart}
            className="inline-flex items-center gap-2.5 bg-ink text-paper px-7 py-3.5 rounded-xl font-display font-600 text-sm hover:bg-ink/80 transition-colors duration-200 group"
          >
            Start your analysis
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16 w-full animate-fade-up-delay-2">
          {[
            { icon: <Database size={14} />, label: "Malaysian open data" },
            { icon: <Brain size={14} />, label: "Context-aware AI" },
            { icon: <Zap size={14} />, label: "Instant insights" },
            { icon: <BarChart3 size={14} />, label: "Predictions" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 bg-white border border-ink/8 rounded-xl p-4"
            >
              <div className="text-amber-500">{f.icon}</div>
              <span className="text-xs font-body text-ink/60 text-center">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs font-body text-ink/30">
        Built for Malaysia · Powered by Z.AI GLM
      </footer>
    </div>
  );
}
