"use client";
import { BusinessMetadata, BusinessType } from "@/lib/types";
import SelectCard from "@/components/ui/SelectCard";
import InputField from "@/components/ui/InputField";

interface Step1Props {
  data: Partial<BusinessMetadata>;
  onChange: (updates: Partial<BusinessMetadata>) => void;
}

const businessTypes: {
  value: BusinessType;
  label: string;
  icon: string;
  description: string;
}[] = [
  { value: "fnb", label: "Food & Beverage", icon: "🍜", description: "Cafe, restaurant, hawker, catering" },
  { value: "retail", label: "Retail", icon: "🛍️", description: "Shop, e-commerce, market stall" },
  { value: "freelancer", label: "Freelancer", icon: "💻", description: "Designer, developer, consultant" },
  { value: "services", label: "Services", icon: "🔧", description: "Repair, cleaning, logistics, tutoring" },
  { value: "manufacturing", label: "Manufacturing", icon: "🏭", description: "Production, crafts, goods" },
  { value: "other", label: "Other", icon: "📦", description: "Something else entirely" },
];

const locations = [
  "Kuala Lumpur", "Selangor", "Johor", "Penang", "Sabah",
  "Sarawak", "Perak", "Kedah", "Negeri Sembilan", "Melaka",
  "Pahang", "Kelantan", "Terengganu", "Perlis", "Putrajaya"
];

const ages = [
  "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"
];

export default function Step1({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-display font-700 text-2xl text-ink mb-1">
          Tell us about your business
        </h2>
        <p className="font-body text-sm text-ink/50">
          This helps us ground our AI analysis in your actual context.
        </p>
      </div>

      {/* Business name */}
      <InputField
        label="Business name"
        placeholder="e.g. Warung Mak Cik Tipah"
        value={data.businessName || ""}
        onChange={(v) => onChange({ businessName: v })}
        required
      />

      {/* Business type */}
      <div>
        <label className="font-display font-600 text-sm text-ink block mb-3">
          Business type <span className="text-amber-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {businessTypes.map((bt) => (
            <SelectCard
              key={bt.value}
              label={bt.label}
              description={bt.description}
              icon={bt.icon}
              selected={data.businessType === bt.value}
              onClick={() => onChange({ businessType: bt.value })}
            />
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="font-display font-600 text-sm text-ink block mb-2">
          State / Location <span className="text-amber-500">*</span>
        </label>
        <select
          className="w-full border-2 border-ink/10 rounded-xl px-4 py-3 font-body text-sm text-ink bg-white focus:outline-none focus:border-ink/50 transition-colors"
          value={data.location || ""}
          onChange={(e) => onChange({ location: e.target.value })}
        >
          <option value="">Select your state…</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Business age */}
      <div>
        <label className="font-display font-600 text-sm text-ink block mb-2">
          How long has your business been running?
        </label>
        <div className="flex flex-wrap gap-2">
          {ages.map((a) => (
            <button
              key={a}
              onClick={() => onChange({ businessAge: a })}
              className={`px-3 py-1.5 rounded-full text-xs font-body border-2 transition-all duration-200 ${
                data.businessAge === a
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-ink/60 border-ink/10 hover:border-ink/30"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
