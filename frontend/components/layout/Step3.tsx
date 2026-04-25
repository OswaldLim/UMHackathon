"use client";
import { BusinessMetadata, GoalType } from "@/lib/types";
import InputField from "@/components/ui/InputField";

interface Step3Props {
  data: Partial<BusinessMetadata>;
  onChange: (updates: Partial<BusinessMetadata>) => void;
}

const goals: { value: GoalType; label: string; icon: string }[] = [
  { value: "increase_profit", label: "Increase profit", icon: "📈" },
  { value: "reduce_cost", label: "Reduce costs", icon: "✂️" },
  { value: "expand", label: "Expand / grow", icon: "🚀" },
  { value: "manage_cashflow", label: "Manage cashflow", icon: "💸" },
  { value: "other", label: "Something else", icon: "🎯" },
];

const horizons = ["This week", "This month", "This quarter", "This year", "Next 2–3 years"];

export default function Step3({ data, onChange }: Step3Props) {
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display font-700 text-2xl text-ink mb-1">
          Your goal & decision
        </h2>
        <p className="font-body text-sm text-ink/50">
          What outcome are you trying to achieve? Be as specific as you can.
        </p>
      </div>

      {/* Main goal */}
      <div>
        <label className="font-display font-600 text-sm text-ink block mb-3">
          Primary goal <span className="text-amber-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {goals.map((g) => (
            <button
              key={g.value}
              onClick={() => onChange({ goal: g.value })}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-body transition-all duration-200 text-left ${
                data.goal === g.value
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink/70 border-ink/10 hover:border-ink/30"
              }`}
            >
              <span className="text-base">{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <InputField
        label="Describe your current problem or situation"
        placeholder="e.g. My sales dropped 30% last month and I'm not sure why. I think it might be…"
        value={data.currentProblem || ""}
        onChange={(v) => onChange({ currentProblem: v })}
        multiline
        required
        hint="The more detail you provide, the more specific our AI analysis will be."
      />

      {/* Time horizon */}
      <div>
        <label className="font-display font-600 text-sm text-ink block mb-3">
          Time horizon for this decision
        </label>
        <div className="flex flex-wrap gap-2">
          {horizons.map((h) => (
            <button
              key={h}
              onClick={() => onChange({ timeHorizon: h })}
              className={`px-3 py-1.5 rounded-full text-xs font-body border-2 transition-all duration-200 ${
                data.timeHorizon === h
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink/60 border-ink/10 hover:border-ink/30"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <InputField
        label="Key constraints or limitations"
        placeholder="e.g. Limited budget, can't hire more staff, no car for deliveries"
        value={data.constraints || ""}
        onChange={(v) => onChange({ constraints: v })}
        hint="What's holding you back? This helps us give realistic recommendations."
      />
    </div>
  );
}
