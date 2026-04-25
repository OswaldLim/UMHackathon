export type BusinessType =
  | "fnb"
  | "retail"
  | "freelancer"
  | "services"
  | "manufacturing"
  | "other";

export type RevenueRange =
  | "below_5k"
  | "5k_20k"
  | "20k_50k"
  | "above_50k";

export type TeamSize = "solo" | "2_5" | "6_20" | "above_20";

export type GoalType =
  | "increase_profit"
  | "reduce_cost"
  | "expand"
  | "manage_cashflow"
  | "other";

export interface BusinessMetadata {
  businessName: string;
  businessType: BusinessType;
  industry: string;
  location: string;
  businessAge: string;
  teamSize: TeamSize;
  revenueRange: RevenueRange;
  mainRevenue: string;
  biggestCost: string;
  currentTools: string;
  peakSeasons: string;
  goal: GoalType;
  currentProblem: string;
  timeHorizon: string;
  constraints: string;
}

export interface AIOutput {
  insight: string;
  recommendations: string[];
  reasoning: string;
  prediction: string;
  tradeoffs: { optionA: string; optionB: string; verdict: string } | null;
}

export type OnboardingStep = 1 | 2 | 3 | 4;
