"use client";
import { BusinessMetadata, TeamSize, RevenueRange } from "@/lib/types";
import InputField from "@/components/ui/InputField";

interface Step2Props {
  data: Partial<BusinessMetadata>;
  onChange: (updates: Partial<BusinessMetadata>) => void;
}

const teamOptions: { value: TeamSize; label: string }[] = [
  { value: "solo", label: "Just me" },
  { value: "2_5", label: "2–5 people" },
  { value: "6_20", label: "6–20 people" },
  { value: "above_20", label: "20+ people" },
];

const revenueOptions: { value: RevenueRange; label: string }[] = [
  { value: "below_5k", label: "Below RM5,000" },
  { value: "5k_20k", label: "RM5,000 – RM20,000" },
  { value: "20k_50k", label: "RM20,000 – RM50,000" },
  { value: "above_50k", label: "Above RM50,000" },
];

export default function Step2({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display font-700 text-2xl text-ink mb-1">
          Operations & Finances
        </h2>
        <p className="font-body text-sm text-ink/50">
          Help us understand how your business runs day-to-day.
        </p>
      </div>

      {/* Team size */}
      <div>
        <label className="font-display font-600 text-sm text-ink block mb-3">
          Team size
        </label>
        <div className="grid grid-cols-2 gap-2">
          {teamOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange({ teamSize: t.value })}
              className={`p-3 rounded-xl border-2 text-sm font-body transition-all duration-200 ${
                data.teamSize === t.value
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink/70 border-ink/10 hover:border-ink/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly revenue */}
      <div>
        <label className="font-display font-600 text-sm text-ink block mb-3">
          Monthly revenue (approximate)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {revenueOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => onChange({ revenueRange: r.value })}
              className={`p-3 rounded-xl border-2 text-sm font-body transition-all duration-200 ${
                data.revenueRange === r.value
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink/70 border-ink/10 hover:border-ink/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <InputField
        label="Main source of revenue"
        placeholder="e.g. Walk-in customers, Grab Food, project contracts"
        value={data.mainRevenue || ""}
        onChange={(v) => onChange({ mainRevenue: v })}
      />

      <InputField
        label="Biggest cost / expense"
        placeholder="e.g. Ingredients, staff wages, rental, delivery fees"
        value={data.biggestCost || ""}
        onChange={(v) => onChange({ biggestCost: v })}
      />

      <InputField
        label="Peak season (if any)"
        placeholder="e.g. Raya, December school holidays, no specific season"
        value={data.peakSeasons || ""}
        onChange={(v) => onChange({ peakSeasons: v })}
      />

      <InputField
        label="Tools you currently use"
        placeholder="e.g. WhatsApp, Excel, Shopee, none"
        value={data.currentTools || ""}
        onChange={(v) => onChange({ currentTools: v })}
        hint="This helps us recommend tools appropriate for your current setup."
      />
    </div>
  );
}
