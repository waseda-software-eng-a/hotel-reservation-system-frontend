import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function TextField({ className = "", label, ...props }: TextFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        className={`rounded-md border border-slate-300 px-3 py-3 outline-none transition focus:border-ocean ${className}`}
        {...props}
      />
    </label>
  );
}
