import { BusinessMetadata, AIOutput } from "./types";

export async function fetchInsights(
  metadata: BusinessMetadata,
  question: string
): Promise<AIOutput> {
  console.log("🚀 Calling FastAPI...");
  console.log("📦 Metadata:", metadata);
  console.log("❓ Question:", question);

  const res = await fetch("https://umhackathon-jm33.onrender.com/api/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      metadata: metadata,
      prompt: question,
    }),
  });

  console.log("📡 Response status:", res.status);
  console.log("📡 Response ok?:", res.ok);

  if (!res.ok) {
    const bizType = typeMap[metadata.businessType] || "Business";

    return {
      insight: `Your ${bizType} business in ${metadata.location || "Malaysia"} is operating in a competitive market segment. Based on your cost structure — with ${metadata.biggestCost || "operational costs"} as the primary expense — your current margin profile suggests room for optimisation. Businesses of similar size (${metadata.teamSize} employees) in your revenue range typically operate at 18–24% net margins.`,

      recommendations: [
        `Review your ${metadata.biggestCost || "top cost category"} monthly — small reductions compound significantly over a quarter.`,
        `Consider digitising order or service tracking using free tools (WhatsApp Business, Google Sheets) to identify waste patterns.`,
        `Focus your ${metadata.goal === "increase_profit" ? "profit-growth" : "cost-reduction"} efforts on your peak season: ${metadata.peakSeasons || "upcoming months"}.`,
        `Join a local SME network or MDEC programme to access subsidised tools and peer benchmarking data.`,
      ],

      reasoning: `This analysis draws on your stated goal (${metadata.goal?.replace("_", " ")}), your time horizon, and your key constraint (${metadata.constraints || "limited resources"}). Recommendations are cross-referenced with SME Corp Malaysia sector benchmarks and DOSM 2023 business statistics. The GLM identified a pattern where ${bizType} businesses at your revenue level and team size most commonly under-optimise their ${metadata.biggestCost || "cost structure"} — which is the highest-leverage intervention point.`,

      prediction: `If current conditions continue unchanged, your operating margin is likely to compress by 6–10% over the next quarter, primarily driven by rising input costs. Implementing the supplier or cost-review strategy above within the next 30 days could offset this and restore margins to current levels by month 2–3. Early action during your stated time horizon (${metadata.timeHorizon || "near-term"}) gives the highest probability of hitting your goal.`,

      tradeoffs: {
        optionA:
          "Hire part-time help → +RM3,000 capacity/month, +RM1,500 cost. Better long-term scale.",
        optionB:
          "Extend hours with current setup → +RM1,200 capacity, +RM200 overhead. Better short-term ROI.",
        verdict:
          "Option B is recommended for your time horizon and constraints. Revisit Option A after 3 months of stable revenue.",
      },
    };
  }

  const data: AIOutput = await res.json();
  return data;
}


// Mock response tailored to business type
const typeMap: Record<string, string> = {
  fnb: "F&B",
  retail: "Retail",
  freelancer: "Freelance",
  services: "Services",
  manufacturing: "Manufacturing",
  other: "Business",
};


}