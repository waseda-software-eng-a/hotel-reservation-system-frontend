"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GuestInfoForm from "@/components/molecules/GuestInfoForm";
import BookingHeader from "@/components/organisms/BookingHeader";
import { useAvailablePlans } from "@/hooks/useAvailablePlans";
import { createReservation } from "@/lib/reservationApi";
import type { GuestInfo, Reservation } from "@/types/reservation";
import { formatCurrency } from "@/utils/formatting";
import {
  createAvailabilityQuery,
  formatStayDate,
  readAvailabilityParams,
} from "@/utils/reservationQuery";

const initialGuestInfo: GuestInfo = {
  fullName: "",
  email: "",
  phone: "",
};

export default function BookingPageClient() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const availability = useMemo(
    () => readAvailabilityParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const planId = searchParams.get("planId") ?? "";
  const roomId = searchParams.get("roomId") ?? "";
  const availabilityQuery = createAvailabilityQuery(availability);
  const plansHref = `/plans?${availabilityQuery.toString()}`;
  const { error: loadError, isLoading, plans } = useAvailablePlans(availability);
  const [guestInfo, setGuestInfo] = useState(initialGuestInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const selectedPlan = plans.find((plan) => plan.id === planId) ?? null;
  const selectedRoom = selectedPlan?.rooms.find((room) => room.id === roomId) ?? null;

  async function handleReserve() {
    if (!selectedPlan || !selectedRoom) {
      setError("選択したプラン・客室を確認できません。プラン一覧から選び直してください。");
      return;
    }

    if (!accepted) {
      setError("キャンセルポリシーと利用条件への同意が必要です。");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const created = await createReservation({
        ...availability,
        planId: selectedPlan.id,
        roomId: selectedRoom.id,
        guestInfo,
      });
      setReservation(created);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "予約に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-ink">
      <BookingHeader activeStep={reservation ? "complete" : "booking"} plansHref={plansHref} />

      {reservation ? (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="border border-[#ccbe9f] bg-white px-6 py-12 md:px-12">
            <p className="text-xs tracking-[0.24em] text-[#856c34]">RESERVATION COMPLETED</p>
            <h1 className="mt-4 font-serif text-3xl font-semibold">ご予約を承りました</h1>
            <p className="mt-6 text-sm text-stone-500">予約番号</p>
            <p className="mt-1 font-serif text-2xl font-semibold">{reservation.id}</p>
            <p className="mt-6 text-sm leading-7 text-stone-600">
              ご予約内容は {reservation.guestInfo.email} 宛にご案内する想定です。
            </p>
            <p className="mt-3 font-serif text-xl">{formatCurrency(reservation.totalPrice)}</p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#856c34] px-8 text-sm font-bold text-white"
              href="/"
            >
              ホテルサイトへ戻る
            </Link>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <div className="mb-8">
            <p className="text-xs tracking-[0.22em] text-[#856c34]">RESERVATION DETAILS</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold">予約内容・お客様情報</h1>
          </div>

          {(error || loadError) && (
            <p className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error || loadError}
            </p>
          )}

          {isLoading ? (
            <div className="h-80 animate-pulse bg-stone-200" />
          ) : selectedPlan && selectedRoom ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <section className="border border-stone-200 bg-white p-5 md:p-7">
                <h2 className="border-b border-stone-200 pb-4 font-serif text-xl font-semibold">
                  お客様情報
                </h2>
                <div className="mt-6">
                  <GuestInfoForm
                    beforeSubmit={
                      <label className="mt-2 flex cursor-pointer items-start gap-3 border-t border-stone-200 pt-5 text-sm leading-6 text-stone-600">
                        <input
                          checked={accepted}
                          className="mt-1 h-4 w-4 accent-[#856c34]"
                          onChange={(event) => setAccepted(event.target.checked)}
                          type="checkbox"
                        />
                        <span>キャンセルポリシーと宿泊利用条件を確認し、内容に同意します。</span>
                      </label>
                    }
                    disabled={false}
                    guestInfo={guestInfo}
                    isSubmitting={isSubmitting}
                    onChange={setGuestInfo}
                    onSubmit={handleReserve}
                  />
                </div>
              </section>

              <aside className="border border-stone-200 bg-white p-5 md:p-7 lg:sticky lg:top-6">
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <Image
                    alt={selectedRoom.name}
                    className="object-cover"
                    fill
                    sizes="420px"
                    src={selectedRoom.imageUrl}
                  />
                </div>
                <p className="mt-5 text-xs text-[#856c34]">選択中のプラン</p>
                <h2 className="mt-2 font-serif text-lg font-semibold leading-7">
                  {selectedPlan.name}
                </h2>
                <p className="mt-4 font-semibold">{selectedRoom.name}</p>
                <dl className="mt-5 grid gap-3 border-y border-stone-200 py-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500">宿泊日</dt>
                    <dd>
                      {formatStayDate(availability.checkInDate)}〜
                      {formatStayDate(availability.checkOutDate)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500">人数・客室</dt>
                    <dd>
                      大人{availability.adults}名 子ども{availability.children}名・
                      {availability.roomCount}室
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone-500">チェックイン / アウト</dt>
                    <dd>
                      {selectedPlan.checkInTime} / {selectedPlan.checkOutTime}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 text-right">
                  <p className="text-xs text-stone-500">合計・税サービス料込</p>
                  <p className="mt-1 font-serif text-2xl font-semibold">
                    {formatCurrency(selectedRoom.totalPrice)}
                  </p>
                </div>
                <details className="mt-5 border-t border-stone-200 pt-4 text-sm text-stone-600">
                  <summary className="cursor-pointer text-[#856c34]">キャンセルポリシー</summary>
                  <p className="mt-3 leading-7">{selectedPlan.cancellationPolicy}</p>
                </details>
                <Link
                  className="mt-6 block text-center text-sm text-[#856c34] underline"
                  href={plansHref}
                >
                  プラン・客室を選び直す
                </Link>
              </aside>
            </div>
          ) : (
            <div className="border border-stone-200 bg-white px-5 py-12 text-center">
              <p className="text-sm text-stone-600">選択したプラン・客室を確認できませんでした。</p>
              <Link
                className="mt-5 inline-flex bg-[#856c34] px-6 py-3 text-sm font-bold text-white"
                href={plansHref}
              >
                プラン一覧へ戻る
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
