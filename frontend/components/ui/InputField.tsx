"use client";
import clsx from "clsx";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
}

export default function InputField({
  label,
  placeholder,
  value,
  onChange,
  hint,
  multiline = false,
  required = false,
}: InputFieldProps) {
  const base =
    "w-full border-2 border-ink/10 rounded-xl px-4 py-3 font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/50 bg-white transition-colors duration-200 resize-none";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display font-600 text-sm text-ink">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          className={clsx(base, "min-h-[90px]")}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          className={base}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p className="text-xs text-ink/40 font-body">{hint}</p>}
    </div>
  );
}
