import Link from "next/link";

type BookingHeaderProps = {
  activeStep: "plans" | "booking" | "complete";
  plansHref?: string;
};

const steps = [
  { id: "conditions", label: "日程・人数" },
  { id: "plans", label: "プラン" },
  { id: "booking", label: "予約内容" },
] as const;

export default function BookingHeader({ activeStep, plansHref = "/plans" }: BookingHeaderProps) {
  const activeIndex = activeStep === "plans" ? 1 : 2;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between px-5">
        <Link className="font-serif text-lg tracking-[0.18em] text-[#1a1a1a]" href="/">
          HOTEL WASERIKO
        </Link>
        <nav aria-label="予約手順" className="hidden sm:block">
          <ol className="flex items-center">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              const className = `flex min-h-20 items-center border-b-2 px-5 text-sm ${
                isActive
                  ? "border-[#856c34] font-bold text-[#856c34]"
                  : "border-transparent text-stone-500"
              }`;

              return (
                <li key={step.id}>
                  {step.id === "conditions" ? (
                    <Link className={className} href="/">
                      {step.label}
                    </Link>
                  ) : step.id === "plans" ? (
                    <Link className={className} href={plansHref}>
                      {step.label}
                    </Link>
                  ) : (
                    <span className={className}>{step.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </header>
  );
}
