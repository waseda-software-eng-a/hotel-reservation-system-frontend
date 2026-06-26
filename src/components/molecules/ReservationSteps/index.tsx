const steps = ["宿泊条件", "部屋選択", "利用者情報"];

type ReservationStepsProps = {
  currentStep: number;
};

export default function ReservationSteps({ currentStep }: ReservationStepsProps) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;

        return (
          <li
            className={`rounded-lg border p-4 ${
              isActive ? "border-ocean bg-teal-50" : "border-slate-200 bg-white"
            }`}
            key={step}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold ${
                isActive ? "bg-ocean text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {stepNumber}
            </span>
            <p className="mt-3 text-sm font-bold">{step}</p>
          </li>
        );
      })}
    </ol>
  );
}
