"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StaySearchForm from "@/components/molecules/StaySearchForm";
import BookingHeader from "@/components/organisms/BookingHeader";
import PlanCard from "@/components/organisms/PlanCard";
import { useAvailablePlans } from "@/hooks/useAvailablePlans";
import type { AvailabilitySearchParams, MealType } from "@/types/reservation";
import {
  createAvailabilityQuery,
  formatStayDate,
  readAvailabilityParams,
} from "@/utils/reservationQuery";

type SortType = "recommended" | "price-asc" | "price-desc";
type MealFilter = "all" | MealType;

export default function PlansPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const availability = useMemo(
    () => readAvailabilityParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const { error, isLoading, plans } = useAvailablePlans(availability);
  const [mealFilter, setMealFilter] = useState<MealFilter>("all");
  const [sort, setSort] = useState<SortType>("recommended");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState<AvailabilitySearchParams>(availability);

  useEffect(() => {
    setDraftSearch(availability);
  }, [availability]);

  const visiblePlans = useMemo(() => {
    const filtered =
      mealFilter === "all" ? plans : plans.filter((plan) => plan.mealType === mealFilter);
    if (sort === "price-asc")
      return [...filtered].sort((a, b) => a.lowestTotalPrice - b.lowestTotalPrice);
    if (sort === "price-desc")
      return [...filtered].sort((a, b) => b.lowestTotalPrice - a.lowestTotalPrice);
    return filtered;
  }, [mealFilter, plans, sort]);

  function updateSearch() {
    router.push(`/plans?${createAvailabilityQuery(draftSearch).toString()}`);
    setIsSearchOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-ink">
      <BookingHeader activeStep="plans" plansHref={`/plans?${queryString}`} />

      <section className="border-b border-stone-200 bg-[#1a1a1a] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <p>
              {formatStayDate(availability.checkInDate)}〜
              {formatStayDate(availability.checkOutDate)}
            </p>
            <p>
              大人{availability.adults}名 子ども{availability.children}名・
              {availability.roomCount}室
            </p>
          </div>
          <button
            className="border border-white/60 px-4 py-2 text-xs transition hover:bg-white hover:text-[#1a1a1a]"
            onClick={() => {
              setDraftSearch(availability);
              setIsSearchOpen((isOpen) => !isOpen);
            }}
            type="button"
          >
            条件を変更
          </button>
        </div>
      </section>

      {isSearchOpen && (
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-5xl">
            <StaySearchForm
              isSearching={false}
              onChange={setDraftSearch}
              onSearch={updateSearch}
              value={draftSearch}
            />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-5 border-b border-stone-300 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] text-[#856c34]">STAY PLANS</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold">宿泊プラン一覧</h1>
            {!isLoading && (
              <p className="mt-2 text-sm text-stone-500">件数：{visiblePlans.length}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="grid gap-1 text-xs text-stone-500">
              食事条件
              <select
                className="min-h-11 border border-stone-300 bg-white px-3 text-sm text-ink"
                onChange={(event) => setMealFilter(event.target.value as MealFilter)}
                value={mealFilter}
              >
                <option value="all">すべて</option>
                <option value="room-only">素泊まり</option>
                <option value="breakfast">朝食付き</option>
                <option value="half-board">夕朝食付き</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs text-stone-500">
              並び順
              <select
                className="min-h-11 border border-stone-300 bg-white px-3 text-sm text-ink"
                onChange={(event) => setSort(event.target.value as SortType)}
                value={sort}
              >
                <option value="recommended">おすすめ順</option>
                <option value="price-asc">料金の安い順</option>
                <option value="price-desc">料金の高い順</option>
              </select>
            </label>
          </div>
        </div>

        {error && (
          <p className="border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        {isLoading ? (
          <div aria-label="プランを読み込み中" className="grid gap-6">
            {[1, 2].map((item) => (
              <div className="h-80 animate-pulse bg-stone-200" key={item} />
            ))}
          </div>
        ) : visiblePlans.length > 0 ? (
          <div className="grid gap-8">
            {visiblePlans.map((plan) => (
              <PlanCard availability={availability} key={plan.id} plan={plan} />
            ))}
          </div>
        ) : !error ? (
          <p className="bg-white px-5 py-12 text-center text-sm text-stone-600">
            条件に一致する宿泊プランがありません。
          </p>
        ) : null}
      </section>
    </main>
  );
}
