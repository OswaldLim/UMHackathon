"use client";
import clsx from "clsx";

interface SelectCardProps {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}

export default function SelectCard({
  label,
  description,
  icon,
  selected,
  onClick,
}: SelectCardProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group",
        selected
          ? "border-ink bg-ink text-paper"
          : "border-ink/10 bg-white hover:border-ink/30 hover:bg-paper"
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <div>
          <div
            className={clsx(
              "font-display font-600 text-sm",
              selected ? "text-paper" : "text-ink"
            )}
          >
            {label}
          </div>
          {description && (
            <div
              className={clsx(
                "text-xs mt-0.5 font-body",
                selected ? "text-paper/70" : "text-ink/50"
              )}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
