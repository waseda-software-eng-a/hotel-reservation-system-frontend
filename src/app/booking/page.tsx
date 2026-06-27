import { Suspense } from "react";
import BookingPageClient from "@/components/templates/BookingPageTemplate";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <BookingPageClient />
    </Suspense>
  );
}
