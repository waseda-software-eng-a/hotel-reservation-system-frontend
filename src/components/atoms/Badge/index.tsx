import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
};

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-600">
      {children}
    </span>
  );
}
