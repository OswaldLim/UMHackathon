// All datasets are fetched from https://api.data.gov.my/data-catalogue?id=<datasetId>
// Dataset IDs are verified from data.gov.my catalogue

import { BusinessType } from "./types";

export interface Dataset {
  id: string;               // data.gov.my catalogue ID
  label: string;            // Human-readable name
  description: string;      // What the data contains
  source: string;           // Publishing agency
  tags: string[];           // Keywords for AI matching
  relevantFor: BusinessType[]; // Which business types benefit most
  previewFields: string[];  // Fields to show in preview table
  unit?: string;            // e.g. "RM", "%", "index"
}

export const DATASETS: Dataset[] = [
  {
    id: "fuelprice",
    label: "Weekly Fuel Prices (RON95, RON97, Diesel)",
    description:
      "Weekly retail fuel prices in Malaysia. Useful for businesses affected by transport and logistics costs.",
    source: "Ministry of Finance / KPDNHEP",
    tags: ["fuel", "petrol", "diesel", "transport", "logistics", "cost", "price"],
    relevantFor: ["fnb", "retail", "services", "manufacturing"],
    previewFields: ["date", "ron95", "ron97", "diesel"],
    unit: "RM/litre",
  },
  {
    id: "cpi_2d",
    label: "Consumer Price Index (CPI) by Category",
    description:
      "Monthly CPI breakdown by category (food, transport, housing, etc.). Measures inflation and cost-of-living trends.",
    source: "DOSM",
    tags: ["cpi", "inflation", "price", "cost", "consumer", "food", "housing"],
    relevantFor: ["fnb", "retail", "services", "freelancer"],
    previewFields: ["date", "division", "index"],
    unit: "Index",
  },
  {
    id: "gdp_gni",
    label: "GDP & GNI by Quarter",
    description:
      "Malaysia's quarterly GDP and GNI figures. Shows overall economic performance and growth trends.",
    source: "DOSM",
    tags: ["gdp", "economy", "growth", "quarterly", "national", "macro"],
    relevantFor: ["manufacturing", "services", "retail"],
    previewFields: ["date", "gdp", "gni"],
    unit: "RM million",
  },
  {
    id: "labour_productivity",
    label: "Labour Productivity by Sector",
    description:
      "Output per worker across sectors. Helps benchmark how productive your business is versus the industry.",
    source: "DOSM",
    tags: ["labour", "productivity", "sector", "worker", "output", "efficiency"],
    relevantFor: ["manufacturing", "services", "fnb"],
    previewFields: ["date", "sector", "productivity_index"],
    unit: "Index",
  },
  {
    id: "wholesale_retail",
    label: "Wholesale & Retail Trade Statistics",
    description:
      "Monthly sales and volume index for wholesale and retail trade. Useful for tracking sector-level sales trends.",
    source: "DOSM",
    tags: ["retail", "wholesale", "sales", "trade", "revenue", "volume"],
    relevantFor: ["retail", "fnb"],
    previewFields: ["date", "sales_value", "volume_index"],
    unit: "RM million",
  },
  {
    id: "exchange_rates",
    label: "Exchange Rates (MYR)",
    description:
      "Daily MYR exchange rates against major currencies. Relevant for businesses importing goods or dealing internationally.",
    source: "Bank Negara Malaysia",
    tags: ["exchange", "currency", "forex", "import", "export", "myr", "usd"],
    relevantFor: ["manufacturing", "retail", "services"],
    previewFields: ["date", "usd", "sgd", "eur", "gbp"],
    unit: "MYR per unit",
  },
  {
    id: "tourism_domestic",
    label: "Domestic Tourism Statistics",
    description:
      "Visitor arrivals and spending by state. Relevant for F&B, retail, and services in tourist areas.",
    source: "Tourism Malaysia / DOSM",
    tags: ["tourism", "visitor", "hotel", "travel", "hospitality", "spending"],
    relevantFor: ["fnb", "retail", "services"],
    previewFields: ["date", "state", "visitors", "spending"],
    unit: "Arrivals / RM million",
  },
  {
    id: "population_malaysia",
    label: "Population by State & Age Group",
    description:
      "Population breakdown by state and age group. Helps understand your local market size and demographics.",
    source: "DOSM",
    tags: ["population", "demographic", "state", "age", "market size", "customer"],
    relevantFor: ["retail", "fnb", "services", "freelancer"],
    previewFields: ["state", "age_group", "population"],
    unit: "Persons",
  },
  {
    id: "household_income_mean",
    label: "Household Income by State",
    description:
      "Mean and median household income by state. Helps understand purchasing power of your target customers.",
    source: "DOSM",
    tags: ["income", "household", "purchasing power", "wealth", "state", "wage"],
    relevantFor: ["retail", "fnb", "services", "freelancer"],
    previewFields: ["state", "mean_income", "median_income"],
    unit: "RM/month",
  },
  {
    id: "sme_stats",
    label: "SME Establishment & Employment",
    description:
      "Number of SMEs, employment, and output by sector and state. Good for benchmarking against similar businesses.",
    source: "SME Corp / DOSM",
    tags: ["sme", "small business", "establishment", "sector", "benchmark", "employment"],
    relevantFor: ["fnb", "retail", "services", "manufacturing", "freelancer"],
    previewFields: ["sector", "state", "establishments", "employment"],
    unit: "Count / Persons",
  },
];

// Flat keyword index for fast local matching before AI call
export const DATASET_KEYWORD_INDEX = DATASETS.map((d) => ({
  id: d.id,
  keywords: [...d.tags, ...d.label.toLowerCase().split(" ")],
}));
