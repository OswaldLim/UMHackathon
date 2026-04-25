"use client";
import { useState } from "react";
import { Send, RefreshCw } from "lucide-react";
import { BusinessMetadata, AIOutput } from "@/lib/types";
import { fetchInsights } from "@/lib/mockApi";
import OutputCard from "@/components/ui/OutputCard";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Step5Props {
  metadata: Partial<BusinessMetadata>;
  onReset: () => void;
}

const suggestedQuestions = [
  "How can I increase my monthly profit?",
  "Where should I cut costs first?",
  "Should I hire more staff or work longer hours?",
  "What's causing my sales to drop?",
  "How do I manage my cashflow better?",
  "Is this a good time to expand my business?",
];

export default function Step5({ metadata, onReset }: Step5Props) {
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState<AIOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const handleAsk = async (q?: string) => {
    const finalQ = q || question;
    if (!finalQ.trim()) return;
    setQuestion(finalQ);
    setLoading(true);
    setAsked(true);
    setOutput(null);
    try {
      const result = await fetchInsights(metadata as BusinessMetadata, finalQ);
      setOutput(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Business + data summary badge */}
      <div className="bg-white border border-ink/8 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm">🏢</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-600 text-sm text-ink">{metadata.businessName || "Your business"}</p>
          <p className="font-body text-xs text-ink/50 mt-0.5">
            {metadata.businessType?.toUpperCase()} · {metadata.location}
          </p>
          {metadata.userData && metadata.userData.source !== "skipped" && (
            <p className="font-body text-xs text-green-600 mt-1">
              ✓ {metadata.userData.source === "recommended"
                ? `Using: ${metadata.userData.datasetLabel}`
                : metadata.userData.source === "upload"
                ? `File: ${metadata.userData.fileName}`
                : `${metadata.userData.rows.length} rows of manual data`}
            </p>
          )}
          {metadata.userData?.source === "skipped" && (
            <p className="font-body text-xs text-ink/40 mt-1">Using sector benchmarks (no personal data)</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display font-700 text-2xl text-ink mb-1">What do you want to decide?</h2>
        <p className="font-body text-sm text-ink/50 mb-4">
          Ask anything about your business. Our AI will analyse your full profile and data, then return structured insights.
        </p>
        <div className="flex gap-2">
          <input
            className="flex-1 border-2 border-ink/10 rounded-xl px-4 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/50 bg-white transition-colors"
            placeholder="e.g. How can I reduce my costs this month?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button onClick={() => handleAsk()} disabled={loading || !question.trim()}
            className="bg-ink text-paper px-4 py-3 rounded-xl disabled:opacity-40 hover:bg-ink/80 transition-colors duration-200 flex-shrink-0">
            <Send size={16} />
          </button>
        </div>

        {!asked && (
          <div className="mt-4">
            <p className="text-xs font-body text-ink/40 mb-2">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button key={q} onClick={() => handleAsk(q)}
                  className="text-xs font-body bg-white border border-ink/10 text-ink/60 px-3 py-1.5 rounded-full hover:border-ink/30 hover:text-ink transition-all duration-200">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && <LoadingSkeleton />}

      {output && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-body text-ink/40 italic">"{question}"</p>
            <button onClick={() => { setOutput(null); setAsked(false); setQuestion(""); }}
              className="flex items-center gap-1.5 text-xs font-body text-ink/40 hover:text-ink transition-colors">
              <RefreshCw size={12} />Ask another
            </button>
          </div>
          <OutputCard title="Insight" accent="amber" icon="🔍" delay={0}>{output.insight}</OutputCard>
          <OutputCard title="Recommendations" accent="sage" icon="✅" delay={100}>
            <ul className="space-y-2">
              {output.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-600 font-display font-700 flex-shrink-0">{i + 1}.</span>{r}
                </li>
              ))}
            </ul>
          </OutputCard>
          <OutputCard title="Reasoning" accent="ink" icon="🧠" delay={200}>{output.reasoning}</OutputCard>
          <OutputCard title="Prediction" accent="coral" icon="📊" delay={300}>{output.prediction}</OutputCard>
          {output.tradeoffs && (
            <OutputCard title="Trade-off Analysis" accent="amber" icon="⚖️" delay={400}>
              <div className="space-y-2">
                <div className="bg-white/60 rounded-lg p-3">
                  <span className="font-display font-600 text-xs text-ink block mb-1">Option A</span>
                  {output.tradeoffs.optionA}
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <span className="font-display font-600 text-xs text-ink block mb-1">Option B</span>
                  {output.tradeoffs.optionB}
                </div>
                <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-400/20">
                  <span className="font-display font-600 text-xs text-amber-600 block mb-1">Verdict</span>
                  {output.tradeoffs.verdict}
                </div>
              </div>
            </OutputCard>
          )}
          <button onClick={onReset}
            className="w-full mt-4 border-2 border-ink/10 rounded-xl py-3 font-body text-sm text-ink/50 hover:border-ink/30 hover:text-ink transition-all duration-200">
            Start a new analysis
          </button>
        </div>
      )}
    </div>
  );
}
