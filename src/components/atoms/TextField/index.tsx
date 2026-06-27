import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function TextField({ className = "", label, ...props }: TextFieldProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold tracking-[0.12em] text-stone-600">
      {label}
      <input
        className={`border border-stone-300 bg-white px-3 py-3 text-sm tracking-normal text-ink outline-none transition focus:border-deepGreen disabled:bg-stone-100 ${className}`}
        {...props}
      />
    </label>
  );
}
