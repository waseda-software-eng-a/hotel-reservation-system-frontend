import Image from "next/image";
import Link from "next/link";
import type { AvailablePlan, AvailabilitySearchParams, MealType } from "@/types/reservation";
import { formatCurrency } from "@/utils/formatting";
import { createAvailabilityQuery } from "@/utils/reservationQuery";

const mealLabels: Record<MealType, string> = {
  "room-only": "素泊まり",
  breakfast: "朝食付き",
  "half-board": "夕朝食付き",
};

const paymentLabels = {
  onsite: "現地払い",
  web: "Web決済",
} as const;

type PlanCardProps = {
  availability: AvailabilitySearchParams;
  plan: AvailablePlan;
};

export default function PlanCard({ availability, plan }: PlanCardProps) {
  return (
    <article className="overflow-hidden border border-stone-200 bg-white shadow-[0_8px_30px_rgba(26,21,10,0.06)]">
      <div className="grid lg:grid-cols-[22rem_1fr]">
        <div className="relative min-h-64 lg:min-h-full">
          <Image
            alt={plan.name}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 352px, 100vw"
            src={plan.imageUrl}
          />
        </div>
        <div className="p-5 md:p-7">
          <div className="flex flex-wrap gap-2">
            {plan.tags.map((tag) => (
              <span className="bg-[#f2eee5] px-3 py-1 text-xs text-[#6e592c]" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-4 font-serif text-2xl font-semibold leading-relaxed text-[#1a1a1a]">
            {plan.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">{plan.summary}</p>
          <dl className="mt-5 grid gap-3 border-y border-stone-200 py-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-stone-500">食事</dt>
              <dd className="mt-1 font-semibold">{mealLabels[plan.mealType]}</dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">お支払い</dt>
              <dd className="mt-1 font-semibold">
                {plan.paymentMethods.map((method) => paymentLabels[method]).join("・")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">チェックイン / アウト</dt>
              <dd className="mt-1 font-semibold">
                {plan.checkInTime} / {plan.checkOutTime}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <details className="text-sm text-stone-600">
              <summary className="cursor-pointer text-[#856c34]">
                プラン詳細・キャンセル条件
              </summary>
              <p className="mt-3 max-w-xl leading-7">{plan.cancellationPolicy}</p>
            </details>
            <div className="text-right">
              <p className="text-xs text-stone-500">
                大人{availability.adults}名・{availability.roomCount}室 / 税・サービス料込
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold">
                {formatCurrency(plan.lowestTotalPrice)}〜
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-stone-200 bg-[#faf9f6] p-5 md:p-7">
        <div className="mb-4 flex items-end justify-between">
          <h3 className="font-serif text-lg font-semibold">選べる客室</h3>
          <p className="text-sm text-stone-500">{plan.rooms.length}室タイプ</p>
        </div>
        <div className="grid gap-3">
          {plan.rooms.map((room) => {
            const bookingQuery = createAvailabilityQuery(availability);
            bookingQuery.set("planId", plan.id);
            bookingQuery.set("roomId", room.id);
            const roomDetailsHref = `/rooms/${room.id}?${bookingQuery.toString()}`;
            const bedLabel =
              room.bedType === "twin"
                ? "ツインベッド"
                : room.bedType === "double"
                  ? "ダブルベッド"
                  : "シングルベッド";

            return (
              <article
                className="grid gap-4 border border-stone-200 bg-white p-4 md:grid-cols-[9rem_1fr_auto] md:items-center"
                key={room.id}
              >
                <div className="relative h-28 overflow-hidden bg-stone-100">
                  <Image
                    alt={room.name}
                    className="object-cover"
                    fill
                    sizes="144px"
                    src={room.imageUrl}
                  />
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    {[room.wing, room.floor, bedLabel, ...room.amenities.slice(0, 2)]
                      .filter(Boolean)
                      .map((label) => (
                        <span
                          className="border border-[#ccbe9f] px-2 py-0.5 text-[11px] text-[#6e592c]"
                          key={label}
                        >
                          {label}
                        </span>
                      ))}
                  </div>
                  <h4 className="mt-2 font-serif text-lg font-semibold">{room.name}</h4>
                  <p className="mt-2 text-sm text-stone-600">
                    {room.sizeSqm}㎡ / 1〜{room.capacity}名 / 残り
                    {room.availableCount}室
                  </p>
                </div>
                <div className="grid gap-3 md:min-w-44 md:justify-items-end">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-stone-500">合計・税サービス料込</p>
                    <p className="mt-1 font-serif text-xl font-semibold">
                      {formatCurrency(room.totalPrice)}
                    </p>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 md:w-auto">
                    <Link
                      className="inline-flex min-h-12 items-center justify-center border border-[#856c34] px-4 text-sm font-bold text-[#856c34] transition hover:bg-[#f2eee5]"
                      href={roomDetailsHref}
                    >
                      客室詳細
                    </Link>
                    <Link
                      className="inline-flex min-h-12 items-center justify-center bg-[#856c34] px-4 text-sm font-bold text-white transition hover:bg-[#755f2d]"
                      href={`/booking?${bookingQuery.toString()}`}
                    >
                      予約する
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </article>
  );
}
