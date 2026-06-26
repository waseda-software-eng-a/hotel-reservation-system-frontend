import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-ocean text-white hover:bg-teal-700",
  secondary: "border border-ocean bg-white text-ocean hover:bg-teal-50",
  ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
};

export default function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClassName[variant]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
