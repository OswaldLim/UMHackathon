import { BusinessMetadata, AIOutput } from "./types";

export async function fetchInsights(
  metadata: BusinessMetadata,
  question: string
): Promise<AIOutput> {
  const res = await fetch("http://localhost:8000/queryrag", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      metadata,
      question,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch insights from backend");
  }

  const data: AIOutput = await res.json();
  return data;
}