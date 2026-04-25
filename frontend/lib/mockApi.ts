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
    throw new Error("Failed to fetch insights from backend");
  }

  const data: AIOutput = await res.json();
  return data;
}