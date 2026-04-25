"use client";
import clsx from "clsx";
import { ReactNode } from "react";

interface OutputCardProps {
  title: string;
  accent: "amber" | "sage" | "coral" | "ink" | "sky";  
  icon: string;
  children: ReactNode;
  delay?: number;
}

const accentMap = {
  amber: "bg-amber-50 border-amber-400/40 text-amber-600",
  sage: "bg-sage-100 border-sage-400/40 text-sage-600",
  coral: "bg-coral-100 border-coral-400/40 text-coral-600",
  ink: "bg-white border-ink/10 text-ink",
  sky: "bg-sky-50 border-sky-400/40 text-sky-600",
};

const tagMap = {
  amber: "bg-amber-400/20 text-amber-600",
  sage: "bg-sage-400/20 text-sage-600",
  coral: "bg-coral-400/20 text-coral-600",
  ink: "bg-ink/10 text-ink",
  sky: "bg-sky-400/20 text-sky-600",
};

export default function OutputCard({
  title,
  accent,
  icon,
  children,
  delay = 0,
}: OutputCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border-2 p-5 animate-fade-up",
        accentMap[accent]
      )}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span
          className={clsx(
            "text-xs font-display font-700 uppercase tracking-widest px-2 py-0.5 rounded-full",
            tagMap[accent]
          )}
        >
          {title}
        </span>
      </div>
      <div className="font-body text-sm leading-relaxed text-ink/80 text-justify">
        {children}
      </div>
    </div>
  );
}
