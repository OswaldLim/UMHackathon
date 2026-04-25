"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  SkipForward,
  Database,
} from "lucide-react";
import { BusinessMetadata, UserData, DataRow } from "@/lib/types";
import { DatasetRecommendation, recommendDatasets, fetchDatasetPreview } from "@/lib/datasetApi";
import { DATASETS } from "@/lib/datasets";
import clsx from "clsx";

interface Step4Props {
  data: Partial<BusinessMetadata>;
  onChange: (updates: Partial<BusinessMetadata>) => void;
}

type Mode = "prompt" | "recommending" | "results" | "preview" | "manual" | "upload" | "done";

const confidenceColor: Record<string, string> = {
  high: "bg-green-50 text-green-700 border-green-300",
  medium: "bg-amber-50 text-amber-600 border-amber-300",
  low: "bg-white text-gray-400 border-gray-200",
};

const confidenceLabel: Record<string, string> = {
  high: "Best match",
  medium: "Good match",
  low: "Possible match",
};

const DEFAULT_HEADERS = ["Month / Period", "Revenue (RM)", "Expenses (RM)", "Notes"];
const emptyRow = (): DataRow =>
  Object.fromEntries(DEFAULT_HEADERS.map((h) => [h, ""]));

export default function Step4({ data, onChange }: Step4Props) {
  const [mode, setMode] = useState<Mode>("prompt");
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState<DatasetRecommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<DatasetRecommendation | null>(null);
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: DataRow[] } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState<DataRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [uploadError, setUploadError] = useState("");

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    setMode("recommending");
    const recs = await recommendDatasets(prompt, data);
    setRecommendations(recs);
    setMode("results");
  };

  const handleSelectDataset = async (rec: DatasetRecommendation) => {
    setSelectedRec(rec);
    setLoadingPreview(true);
    setMode("preview");
    const preview = await fetchDatasetPreview(rec.dataset.id);
    setPreviewData(preview);
    setLoadingPreview(false);
  };

  const handleConfirmDataset = () => {
    if (!previewData || !selectedRec) return;
    const userData: UserData = {
      source: "recommended",
      datasetId: selectedRec.dataset.id,
      datasetLabel: selectedRec.dataset.label,
      headers: previewData.headers,
      rows: previewData.rows,
    };
    onChange({ userData });
    setMode("done");
  };

  const handleManualChange = (rowIdx: number, col: string, val: string) => {
    setManualRows((prev) => {
      const updated = [...prev];
      updated[rowIdx] = { ...updated[rowIdx], [col]: val };
      return updated;
    });
  };

  const handleManualConfirm = () => {
    const filledRows = manualRows.filter((r) =>
      Object.values(r).some((v) => String(v).trim() !== "")
    );
    onChange({ userData: { source: "manual", headers: DEFAULT_HEADERS, rows: filledRows } });
    setMode("done");
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only allow CSV files
    const isCsvByExtension = file.name.toLowerCase().endsWith(".csv");
    const isCsvByType =
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel" ||
      file.type === "";

    if (!isCsvByExtension || !isCsvByType) {
      setUploadError("Only CSV files (.csv) are allowed.");
      e.target.value = "";
      return;
    }

    setUploadError("");

    try {
      console.log("🚀 Uploading CSV to FastAPI...");

      // Send file directly to FastAPI /api/ingest
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://umhackathon-jm33.onrender.com/api/ingest",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("📡 Upload response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Upload failed:", errorText);
        throw new Error("Failed to upload CSV file");
      }

      const backendResponse = await res.json();
      console.log("✅ Backend upload success:", backendResponse);

      // Optional frontend preview of CSV data
      const reader = new FileReader();

      reader.onload = (ev) => {
        const text = ev.target?.result as string;

        const lines = text.trim().split("\n").filter(Boolean);

        if (lines.length < 2) {
          setUploadError(
            "CSV must have at least a header row and one data row."
          );
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));

        const rows: DataRow[] = lines.slice(1).map((line) => {
          const vals = line
            .split(",")
            .map((v) => v.trim().replace(/"/g, ""));

          return Object.fromEntries(
            headers.map((h, i) => [
              h,
              isNaN(Number(vals[i])) ? vals[i] : Number(vals[i]),
            ])
          );
        });

        onChange({
          userData: {
            source: "upload",
            headers,
            rows,
            fileName: file.name,
          },
        });

        setMode("done");
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      setUploadError("Failed to upload CSV file to backend.");
    }
  };

  const handleSkip = () => {
    onChange({ userData: { source: "skipped", headers: [], rows: [] } });
    setMode("done");
  };

  const resetAll = () => {
    setMode("prompt");
    setRecommendations([]);
    setSelectedRec(null);
    setPreviewData(null);
    setPrompt("");
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display font-700 text-2xl text-ink mb-1">
          Add data for better insights
        </h2>
        <p className="font-body text-sm text-ink/50">
          Describe what data you need — our AI will find the best Malaysian open
          dataset for your situation.
        </p>
      </div>

      {/* PROMPT MODE */}
      {(mode === "prompt" || mode === "recommending") && (
        <div className="space-y-5">
          <div className="bg-white border-2 border-ink/8 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-amber-500" />
              <span className="font-display font-600 text-sm text-ink">
                Tell the AI what data you need
              </span>
            </div>
            <textarea
              className="w-full border-2 border-ink/10 rounded-xl px-4 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/50 bg-paper resize-none transition-colors"
              rows={3}
              placeholder='e.g. "I want to compare my sales against retail trends" or "I need fuel price data because delivery costs are hurting my margins"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleAskAI}
              disabled={!prompt.trim() || mode === "recommending"}
              className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-3 rounded-xl font-display font-600 text-sm disabled:opacity-40 hover:bg-ink/80 transition-colors duration-200"
            >
              {mode === "recommending" ? (
                <><RefreshCw size={14} className="animate-spin" />AI is finding datasets…</>
              ) : (
                <><Search size={14} />Find datasets</>
              )}
            </button>
          </div>

          <div>
            <p className="text-xs font-body text-ink/40 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Show me inflation trends for food prices",
                "I need income data by state",
                "Fuel prices are hurting my transport costs",
                "Compare me to other SMEs in Malaysia",
              ].map((ex) => (
                <button key={ex} onClick={() => setPrompt(ex)}
                  className="text-xs font-body bg-white border border-ink/10 text-ink/60 px-3 py-1.5 rounded-full hover:border-ink/30 hover:text-ink transition-all">
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink/8" />
            <span className="text-xs font-body text-ink/30">or choose manually</span>
            <div className="flex-1 h-px bg-ink/8" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Database size={14} />, label: "Browse datasets", action: () => { setRecommendations([]); setMode("results"); } },
              { icon: <Plus size={14} />, label: "Enter manually", action: () => setMode("manual") },
              { icon: <Upload size={14} />, label: "Upload CSV", action: () => setMode("upload") },
            ].map((btn) => (
              <button key={btn.label} onClick={btn.action}
                className="flex flex-col items-center gap-1.5 p-3 bg-white border-2 border-ink/8 rounded-xl text-ink/50 hover:border-ink/20 hover:text-ink transition-all text-xs font-body">
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>

          <button onClick={handleSkip}
            className="w-full flex items-center justify-center gap-2 text-sm font-body text-ink/30 hover:text-ink/60 transition-colors py-2">
            <SkipForward size={13} />Skip — I don't have data right now
          </button>
        </div>
      )}

      {/* RESULTS MODE */}
      {mode === "results" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display font-600 text-sm text-ink">
              {recommendations.length > 0 ? `AI found ${recommendations.length} matching dataset${recommendations.length > 1 ? "s" : ""}` : "All available datasets"}
            </p>
            <button onClick={() => { setMode("prompt"); setRecommendations([]); }}
              className="text-xs font-body text-ink/40 hover:text-ink flex items-center gap-1 transition-colors">
              <RefreshCw size={11} /> Try again
            </button>
          </div>

          {(recommendations.length > 0
            ? recommendations.map((r) => ({ rec: r, dataset: r.dataset }))
            : DATASETS.map((d) => ({ rec: null as DatasetRecommendation | null, dataset: d }))
          ).map(({ rec, dataset }) => (
            <div key={dataset.id} className="bg-white border-2 border-ink/8 rounded-xl overflow-hidden hover:border-ink/20 transition-all">
              <button className="w-full text-left p-4"
                onClick={() => setExpandedRec(expandedRec === dataset.id ? null : dataset.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-600 text-sm text-ink">{dataset.label}</span>
                      {rec && (
                        <span className={clsx("text-[10px] font-display font-600 px-2 py-0.5 rounded-full border", confidenceColor[rec.confidence])}>
                          {confidenceLabel[rec.confidence]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-body text-ink/50 mt-1">{dataset.source}</p>
                  </div>
                  {expandedRec === dataset.id ? <ChevronUp size={15} className="text-ink/30 flex-shrink-0 mt-0.5" /> : <ChevronDown size={15} className="text-ink/30 flex-shrink-0 mt-0.5" />}
                </div>
              </button>
              {expandedRec === dataset.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-ink/5 pt-3">
                  <p className="text-sm font-body text-ink/70">{dataset.description}</p>
                  {rec && (
                    <div className="bg-amber-50 border border-amber-400/20 rounded-lg p-3">
                      <p className="text-xs font-body text-amber-700">
                        <span className="font-display font-600">Why this dataset: </span>{rec.reason}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => handleSelectDataset(rec ?? { dataset, reason: "", confidence: "low" as const })}
                    className="w-full bg-ink text-paper py-2.5 rounded-lg font-display font-600 text-xs hover:bg-ink/80 transition-colors">
                    Use this dataset →
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setMode("manual")}
              className="flex-1 border-2 border-ink/10 rounded-xl py-2.5 text-xs font-body text-ink/50 hover:border-ink/20 hover:text-ink transition-all flex items-center justify-center gap-1.5">
              <Plus size={12} /> Enter my own data
            </button>
            <button onClick={() => setMode("upload")}
              className="flex-1 border-2 border-ink/10 rounded-xl py-2.5 text-xs font-body text-ink/50 hover:border-ink/20 hover:text-ink transition-all flex items-center justify-center gap-1.5">
              <Upload size={12} /> Upload CSV
            </button>
          </div>
          <button onClick={handleSkip} className="w-full text-center text-xs font-body text-ink/30 hover:text-ink/50 transition-colors py-1">
            Skip this step
          </button>
        </div>
      )}

      {/* PREVIEW MODE */}
      {mode === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-600 text-sm text-ink">{selectedRec?.dataset.label}</p>
              <p className="text-xs font-body text-ink/40">Source: {selectedRec?.dataset.source} · Sample rows</p>
            </div>
            <button onClick={() => setMode("results")} className="text-xs font-body text-ink/40 hover:text-ink transition-colors">← Back</button>
          </div>

          {loadingPreview ? (
            <div className="space-y-2">{[1,2,3,4].map((i) => <div key={i} className="shimmer h-9 rounded-lg" />)}</div>
          ) : previewData ? (
            <div className="rounded-xl border border-ink/8 overflow-x-auto">
              <table className="w-full text-xs font-body">
                <thead>
                  <tr className="bg-black/5 border-b border-ink/8">
                    {previewData.headers.map((h) => <th key={h} className="text-left px-3 py-2.5 font-display font-600 text-ink/70 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, i) => (
                    <tr key={i} className="border-b border-ink/5 last:border-none">
                      {previewData.headers.map((h) => <td key={h} className="px-3 py-2.5 text-ink/70 whitespace-nowrap">{String(row[h] ?? "—")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="bg-amber-50 border border-amber-400/20 rounded-xl p-3">
            <p className="text-xs font-body text-amber-700">
              <span className="font-display font-600">Note: </span>
              Sample preview only. Full dataset is fetched and analysed when generating insights.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setMode("results")} className="flex-1 border-2 border-ink/10 rounded-xl py-3 text-sm font-body text-ink/50 hover:border-ink/20 transition-all">Choose different</button>
            <button onClick={handleConfirmDataset} className="flex-1 bg-ink text-paper py-3 rounded-xl font-display font-600 text-sm hover:bg-ink/80 transition-colors">Use this data ✓</button>
          </div>
        </div>
      )}

      {/* MANUAL MODE */}
      {mode === "manual" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display font-600 text-sm text-ink">Enter your data</p>
            <button onClick={() => setMode("prompt")} className="text-xs font-body text-ink/40 hover:text-ink transition-colors">← Back</button>
          </div>
          <p className="text-xs font-body text-ink/50">Fill in your own figures. Add as many rows as you need.</p>
          <div className="rounded-xl border border-ink/8 overflow-x-auto">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="bg-black/5 border-b border-ink/8">
                  {DEFAULT_HEADERS.map((h) => <th key={h} className="text-left px-3 py-2.5 font-display font-600 text-ink/70 whitespace-nowrap">{h}</th>)}
                  <th className="px-2 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {manualRows.map((row, i) => (
                  <tr key={i} className="border-b border-ink/5 last:border-none">
                    {DEFAULT_HEADERS.map((h) => (
                      <td key={h} className="px-2 py-1.5">
                        <input
                          className="w-full min-w-[80px] border border-ink/10 rounded-lg px-2 py-1.5 text-ink bg-white focus:outline-none focus:border-ink/40 transition-colors placeholder:text-ink/20"
                          placeholder={h.includes("RM") ? "0.00" : "—"}
                          value={String(row[h] ?? "")}
                          onChange={(e) => handleManualChange(i, h, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <button onClick={() => setManualRows((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-ink/20 hover:text-red-400 transition-colors p-1"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setManualRows((prev) => [...prev, emptyRow()])}
            className="flex items-center gap-2 text-xs font-body text-ink/40 hover:text-ink transition-colors">
            <Plus size={13} /> Add row
          </button>
          <div className="flex gap-2">
            <button onClick={() => setMode("prompt")} className="flex-1 border-2 border-ink/10 rounded-xl py-3 text-sm font-body text-ink/50 hover:border-ink/20 transition-all">Back</button>
            <button onClick={handleManualConfirm} className="flex-1 bg-ink text-paper py-3 rounded-xl font-display font-600 text-sm hover:bg-ink/80 transition-colors">Save data ✓</button>
          </div>
        </div>
      )}

      {/* UPLOAD MODE */}
      {mode === "upload" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display font-600 text-sm text-ink">Upload your CSV</p>
            <button onClick={() => setMode("prompt")} className="text-xs font-body text-ink/40 hover:text-ink transition-colors">← Back</button>
          </div>
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-ink/15 rounded-2xl p-10 cursor-pointer hover:border-ink/30 hover:bg-ink/2 transition-all">
            <Upload size={24} className="text-ink/30" />
            <div className="text-center">
              <p className="font-display font-600 text-sm text-ink">Drop your CSV here</p>
              <p className="text-xs font-body text-ink/40 mt-1">or click to browse files</p>
            </div>
            <span className="text-xs font-body text-ink/30 bg-ink/5 px-3 py-1 rounded-full">.csv files only</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          {uploadError && (
            <p className="text-xs font-body text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{uploadError}</p>
          )}
          <div className="bg-ink/3 rounded-xl p-3">
            <p className="text-xs font-body text-ink/50">
              <span className="font-display font-600 text-ink">CSV tips: </span>
              First row = column headers. Include dates, revenue, expenses, or any numbers. No special format needed.
            </p>
          </div>
          <button onClick={handleSkip} className="w-full text-center text-xs font-body text-ink/30 hover:text-ink/50 transition-colors py-1">
            Skip — I don't have a file
          </button>
        </div>
      )}

      {/* DONE MODE */}
      {mode === "done" && (
        <div className="space-y-4 animate-fade-up">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 size={20} className="text-green-600" />
              <div>
                <p className="font-display font-600 text-sm text-ink">
                  {data.userData?.source === "skipped" ? "Skipped — no data added"
                    : data.userData?.source === "manual" ? "Manual data saved"
                    : data.userData?.source === "upload" ? `File uploaded: ${data.userData.fileName}`
                    : `Dataset selected: ${data.userData?.datasetLabel}`}
                </p>
                <p className="text-xs font-body text-ink/50 mt-0.5">
                  {data.userData?.source === "skipped"
                    ? "AI will use sector benchmarks and open data instead."
                    : `${data.userData?.rows?.length ?? 0} rows ready for analysis`}
                </p>
              </div>
            </div>
            {data.userData && data.userData.source !== "skipped" && data.userData.rows.length > 0 && (
              <div className="rounded-lg border border-green-200 overflow-x-auto bg-white/60">
                <table className="w-full text-xs font-body">
                  <thead>
                    <tr className="border-b border-green-100">
                      {data.userData.headers.slice(0, 4).map((h) => (
                        <th key={h} className="text-left px-3 py-2 font-display font-600 text-ink/60 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.userData.rows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-green-100 last:border-none">
                        {data.userData!.headers.slice(0, 4).map((h) => (
                          <td key={h} className="px-3 py-2 text-ink/60 whitespace-nowrap">{String(row[h] ?? "—")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <button onClick={resetAll}
            className="w-full border-2 border-ink/10 rounded-xl py-2.5 text-xs font-body text-ink/40 hover:border-ink/20 hover:text-ink transition-all flex items-center justify-center gap-1.5">
            <RefreshCw size={12} /> Change data selection
          </button>
        </div>
      )}
    </div>
  );
}
