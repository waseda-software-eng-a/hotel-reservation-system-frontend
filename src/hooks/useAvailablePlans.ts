"use client";

import { useEffect, useState } from "react";
import { searchAvailablePlans } from "@/lib/reservationApi";
import type { AvailablePlan, AvailabilitySearchParams } from "@/types/reservation";

export function useAvailablePlans(params: AvailabilitySearchParams) {
  const [plans, setPlans] = useState<AvailablePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError("");

    searchAvailablePlans(params)
      .then((nextPlans) => {
        if (isCurrent) setPlans(nextPlans);
      })
      .catch((searchError: unknown) => {
        if (isCurrent) {
          setPlans([]);
          setError(
            searchError instanceof Error ? searchError.message : "プラン検索に失敗しました。",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [params]);

  return { error, isLoading, plans };
}
