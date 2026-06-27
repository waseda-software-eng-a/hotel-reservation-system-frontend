import type { SelectHTMLAttributes } from "react";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { label: string; value: string }[];
};

export default function SelectField({
  className = "",
  label,
  options,
  ...props
}: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold tracking-[0.12em] text-stone-600">
      {label}
      <select
        className={`border border-stone-300 bg-white px-3 py-3 text-sm tracking-normal text-ink outline-none transition focus:border-deepGreen ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
