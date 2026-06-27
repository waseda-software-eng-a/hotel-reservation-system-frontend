import { Suspense } from "react";
import PlansPageClient from "@/components/templates/PlansPageTemplate";

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <PlansPageClient />
    </Suspense>
  );
}
