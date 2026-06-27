import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "border border-deepGreen bg-deepGreen text-white hover:bg-white hover:text-deepGreen",
  secondary: "border border-deepGreen bg-white text-deepGreen hover:bg-ivory",
  ghost: "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100",
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
      className={`px-4 py-3 text-sm font-bold tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClassName[variant]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
