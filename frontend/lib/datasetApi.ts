import { BusinessMetadata, UserData, DataRow } from "./types";
import { Dataset, DATASETS } from "./datasets";

// ─── Dataset Recommendation ────────────────────────────────────────────────
// In production: replace this with a real Z.AI GLM call from the backend.
// The backend receives the user's free-text description + business metadata,
// calls Z.AI, and returns a ranked list of dataset IDs with explanations.

export interface DatasetRecommendation {
  dataset: Dataset;
  reason: string;
  confidence: "high" | "medium" | "low";
}

export async function recommendDatasets(
  userPrompt: string,
  metadata: Partial<BusinessMetadata>
): Promise<DatasetRecommendation[]> {
  // Simulate AI thinking delay
  await new Promise((r) => setTimeout(r, 1800));

  const prompt = userPrompt.toLowerCase();
  const bizType = metadata.businessType;

  // Simple keyword scoring — replace with real GLM call
  const scored = DATASETS.map((d) => {
    let score = 0;

    // Match against user prompt keywords
    d.tags.forEach((tag) => {
      if (prompt.includes(tag)) score += 3;
    });

    // Match against business type relevance
    if (bizType && d.relevantFor.includes(bizType)) score += 2;

    // Match label words against prompt
    d.label
      .toLowerCase()
      .split(" ")
      .forEach((word) => {
        if (prompt.includes(word)) score += 1;
      });

    return { dataset: d, score };
  });

  // Sort by score, take top 3
  const top = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // If nothing matched, return top 2 by business type relevance
  const fallback =
    top.length === 0
      ? DATASETS.filter(
          (d) => bizType && d.relevantFor.includes(bizType)
        ).slice(0, 2)
      : top.map((t) => t.dataset);

  const results = (top.length > 0 ? top.map((t) => t.dataset) : fallback);

  return results.map((d, i) => ({
    dataset: d,
    reason: generateReason(d, userPrompt, metadata),
    confidence: i === 0 ? "high" : i === 1 ? "medium" : "low",
  }));
}

function generateReason(
  d: Dataset,
  prompt: string,
  metadata: Partial<BusinessMetadata>
): string {
  const bizName = metadata.businessName || "your business";
  const reasons: Record<string, string> = {
    fuelprice: `Fuel prices directly affect your delivery and operational costs. Tracking weekly changes helps ${bizName} anticipate cost spikes.`,
    cpi_2d: `CPI data shows inflation trends by category — essential for understanding how rising costs affect your pricing strategy.`,
    gdp_gni: `GDP growth trends indicate overall consumer spending power, helping ${bizName} forecast demand.`,
    labour_productivity: `Benchmarking your labour productivity against sector averages reveals efficiency gaps and opportunities.`,
    wholesale_retail: `Sector-level sales trends show how similar businesses are performing, giving ${bizName} a market baseline.`,
    exchange_rates: `If you import goods or materials, exchange rate fluctuations directly affect your input costs.`,
    tourism_domestic: `Visitor statistics by state help estimate foot traffic and seasonal demand for your location.`,
    population_malaysia: `Population and demographic data helps size your addressable market and understand your customer base.`,
    household_income_mean: `Household income data reveals the purchasing power of your target customers by state.`,
    sme_stats: `SME statistics let ${bizName} benchmark against peers in the same sector and state.`,
  };
  return reasons[d.id] || `This dataset is relevant to your query about "${prompt}".`;
}

// ─── Mock Data Fetch ───────────────────────────────────────────────────────
// In production: backend proxies the real data.gov.my API call and returns
// parsed rows. Frontend just displays whatever comes back.

export async function fetchDatasetPreview(
  datasetId: string
): Promise<{ headers: string[]; rows: DataRow[] }> {
  await new Promise((r) => setTimeout(r, 1200));

  const mockData: Record<string, { headers: string[]; rows: DataRow[] }> = {
    fuelprice: {
      headers: ["Date", "RON95 (RM)", "RON97 (RM)", "Diesel (RM)"],
      rows: [
        { Date: "2025-01-01", "RON95 (RM)": 2.05, "RON97 (RM)": 3.47, "Diesel (RM)": 2.15 },
        { Date: "2025-01-08", "RON95 (RM)": 2.05, "RON97 (RM)": 3.52, "Diesel (RM)": 2.15 },
        { Date: "2025-01-15", "RON95 (RM)": 2.05, "RON97 (RM)": 3.49, "Diesel (RM)": 2.15 },
        { Date: "2025-01-22", "RON95 (RM)": 2.05, "RON97 (RM)": 3.55, "Diesel (RM)": 2.15 },
        { Date: "2025-01-29", "RON95 (RM)": 2.05, "RON97 (RM)": 3.58, "Diesel (RM)": 2.15 },
      ],
    },
    cpi_2d: {
      headers: ["Date", "Category", "CPI Index"],
      rows: [
        { Date: "2024-12", Category: "Food & Non-Alcoholic Beverages", "CPI Index": 138.2 },
        { Date: "2024-12", Category: "Housing & Utilities", "CPI Index": 129.8 },
        { Date: "2024-12", Category: "Transport", "CPI Index": 122.4 },
        { Date: "2024-12", Category: "Restaurants & Hotels", "CPI Index": 141.5 },
        { Date: "2024-12", Category: "Clothing & Footwear", "CPI Index": 106.3 },
      ],
    },
    household_income_mean: {
      headers: ["State", "Mean Income (RM)", "Median Income (RM)"],
      rows: [
        { State: "Kuala Lumpur", "Mean Income (RM)": 11716, "Median Income (RM)": 8700 },
        { State: "Selangor", "Mean Income (RM)": 9168, "Median Income (RM)": 6900 },
        { State: "Johor", "Mean Income (RM)": 6855, "Median Income (RM)": 5200 },
        { State: "Penang", "Mean Income (RM)": 7509, "Median Income (RM)": 5700 },
        { State: "Perak", "Mean Income (RM)": 5281, "Median Income (RM)": 3900 },
      ],
    },
    sme_stats: {
      headers: ["Sector", "Establishments", "Employment"],
      rows: [
        { Sector: "Services", Establishments: 907975, Employment: 3821400 },
        { Sector: "Manufacturing", Establishments: 56789, Employment: 1234500 },
        { Sector: "Agriculture", Establishments: 41230, Employment: 298700 },
        { Sector: "Construction", Establishments: 45610, Employment: 412300 },
        { Sector: "Mining & Quarrying", Establishments: 3210, Employment: 48900 },
      ],
    },
  };

  return (
    mockData[datasetId] ?? {
      headers: ["Date", "Value", "Category"],
      rows: [
        { Date: "2024-Q4", Value: 1240.5, Category: "Baseline" },
        { Date: "2024-Q3", Value: 1180.2, Category: "Baseline" },
        { Date: "2024-Q2", Value: 1095.8, Category: "Baseline" },
      ],
    }
  );
}
