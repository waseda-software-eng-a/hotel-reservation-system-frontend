"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import BookingHeader from "@/components/organisms/BookingHeader";
import { useAvailablePlans } from "@/hooks/useAvailablePlans";
import type { BedType, MealType, RoomType } from "@/types/reservation";
import { formatCurrency } from "@/utils/formatting";
import {
  createAvailabilityQuery,
  formatStayDate,
  readAvailabilityParams,
} from "@/utils/reservationQuery";

const bedLabels: Record<BedType, string> = {
  single: "シングルベッド",
  double: "ダブルベッド",
  twin: "ツインベッド",
};

const roomTypeLabels: Record<RoomType, string> = {
  single: "シングル",
  double: "ダブル",
  twin: "ツイン",
  suite: "スイート",
};

const mealLabels: Record<MealType, string> = {
  "room-only": "素泊まり",
  breakfast: "朝食付き",
  "half-board": "夕朝食付き",
};

export default function RoomDetailsPageTemplate({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const availability = useMemo(
    () => readAvailabilityParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const planId = searchParams.get("planId") ?? "";
  const availabilityQuery = createAvailabilityQuery(availability);
  const plansHref = `/plans?${availabilityQuery.toString()}`;
  const bookingQuery = createAvailabilityQuery(availability);
  bookingQuery.set("planId", planId);
  bookingQuery.set("roomId", roomId);

  const { error, isLoading, plans } = useAvailablePlans(availability);
  const selectedPlan = plans.find((plan) => plan.id === planId) ?? null;
  const room = selectedPlan?.rooms.find((candidate) => candidate.id === roomId) ?? null;

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">
      <BookingHeader activeStep="plans" plansHref={plansHref} />

      <section className="border-b border-stone-200 bg-[#1a1a1a] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm">
          <p>
            {formatStayDate(availability.checkInDate)}〜{formatStayDate(availability.checkOutDate)}
          </p>
          <p>
            大人{availability.adults}名 子ども{availability.children}名・
            {availability.roomCount}室
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="h-[34rem] animate-pulse bg-stone-200" />
        </div>
      ) : error || !selectedPlan || !room ? (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="border border-stone-200 bg-white px-6 py-12">
            <h1 className="font-serif text-2xl font-semibold">客室情報を確認できませんでした</h1>
            <p className="mt-4 text-sm text-stone-600">
              {error || "検索条件を変更したか、現在この客室を予約できない可能性があります。"}
            </p>
            <Link
              className="mt-7 inline-flex min-h-12 items-center bg-[#856c34] px-7 text-sm font-bold text-white"
              href={plansHref}
            >
              プラン一覧へ戻る
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="border-b border-stone-200 bg-white">
            <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
              <p className="text-xs tracking-[0.22em] text-[#856c34]">ROOM DETAILS</p>
              <p className="mt-4 text-sm text-stone-500">{selectedPlan.name}</p>
              <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight md:text-4xl">
                {room.name}
              </h1>
              <div className="mt-5 flex flex-wrap gap-2">
                {[room.wing, room.floor, bedLabels[room.bedType], ...room.amenities]
                  .filter(Boolean)
                  .map((label) => (
                    <span
                      className="border border-[#ccbe9f] px-3 py-1 text-xs text-[#6e592c]"
                      key={label}
                    >
                      {label}
                    </span>
                  ))}
              </div>
            </div>
          </section>

          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
            <article className="overflow-hidden border border-stone-200 bg-white">
              <div className="relative aspect-video bg-stone-100">
                <Image
                  alt={room.name}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 760px, 100vw"
                  src={room.imageUrl}
                />
              </div>

              <div className="p-6 md:p-8">
                <ul className="grid border-y border-stone-200 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["客室タイプ", roomTypeLabels[room.type]],
                    ["広さ", `${room.sizeSqm}㎡`],
                    ["定員", `1〜${room.capacity}名`],
                    ["ベッド", bedLabels[room.bedType]],
                  ].map(([label, value]) => (
                    <li
                      className="border-b border-stone-200 px-4 py-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                      key={label}
                    >
                      <p className="text-xs text-stone-500">{label}</p>
                      <p className="mt-2 text-sm font-semibold">{value}</p>
                    </li>
                  ))}
                </ul>

                <section className="py-8">
                  <h2 className="font-serif text-2xl font-semibold">客室について</h2>
                  <p className="mt-5 text-sm leading-8 text-stone-600">{room.description}</p>
                </section>

                <section className="border-t border-stone-200 pt-8">
                  <h2 className="font-serif text-2xl font-semibold">主な設備・アメニティ</h2>
                  <ul className="mt-6 grid gap-x-8 gap-y-3 text-sm text-stone-700 sm:grid-cols-2">
                    {room.amenities.map((amenity) => (
                      <li
                        className="flex items-center gap-3 border-b border-stone-100 pb-3"
                        key={amenity}
                      >
                        <span className="text-[#856c34]">◆</span>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </article>

            <aside className="border border-stone-200 bg-white p-6 lg:sticky lg:top-6">
              <p className="text-xs tracking-[0.16em] text-[#856c34]">SELECTED PLAN</p>
              <h2 className="mt-3 font-serif text-lg font-semibold leading-7">
                {selectedPlan.name}
              </h2>
              <dl className="mt-6 grid gap-4 border-y border-stone-200 py-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">食事</dt>
                  <dd className="font-semibold">{mealLabels[selectedPlan.mealType]}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">宿泊数</dt>
                  <dd className="font-semibold">{room.nights}泊</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">残室数</dt>
                  <dd className="font-semibold">{room.availableCount}室</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">チェックイン</dt>
                  <dd className="font-semibold">{selectedPlan.checkInTime}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone-500">チェックアウト</dt>
                  <dd className="font-semibold">{selectedPlan.checkOutTime}</dd>
                </div>
              </dl>
              <div className="mt-6 text-right">
                <p className="text-xs text-stone-500">合計・税サービス料込</p>
                <p className="mt-1 font-serif text-2xl font-semibold">
                  {formatCurrency(room.totalPrice)}
                </p>
              </div>
              <Link
                className="mt-6 flex min-h-14 items-center justify-center bg-[#856c34] px-6 text-sm font-bold text-white transition hover:bg-[#755f2d]"
                href={`/booking?${bookingQuery.toString()}`}
              >
                この客室を予約する
              </Link>
              <Link
                className="mt-4 block text-center text-sm text-[#856c34] underline underline-offset-4"
                href={plansHref}
              >
                プラン一覧へ戻る
              </Link>
              <details className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600">
                <summary className="cursor-pointer text-[#856c34]">キャンセルポリシー</summary>
                <p className="mt-3 leading-7">{selectedPlan.cancellationPolicy}</p>
              </details>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
