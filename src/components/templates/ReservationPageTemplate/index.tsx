"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import StaySearchForm from "@/components/molecules/StaySearchForm";
import HotelSiteHeader from "@/components/organisms/HotelSiteHeader";
import type { AvailabilitySearchParams } from "@/types/reservation";
import { createAvailabilityQuery } from "@/utils/reservationQuery";

const initialSearchState: AvailabilitySearchParams = {
  hotelId: "waseda-tokyo",
  checkInDate: "",
  checkOutDate: "",
  adults: 2,
  children: 0,
  roomCount: 1,
};

export default function ReservationPageTemplate() {
  const router = useRouter();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchState, setSearchState] = useState<AvailabilitySearchParams>(initialSearchState);

  function searchFromHeader() {
    if (!searchState.checkInDate || !searchState.checkOutDate) {
      setSearchError("チェックイン日とチェックアウト日を選択してください。");
      return;
    }

    if (searchState.checkOutDate <= searchState.checkInDate) {
      setSearchError("チェックアウト日はチェックイン日より後にしてください。");
      return;
    }

    setSearchError("");
    setIsSearching(true);
    router.push(`/plans?${createAvailabilityQuery(searchState).toString()}`);
  }

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <HotelSiteHeader onReservationOpen={() => setIsReservationOpen(true)} />

      {isReservationOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 px-4 py-6 md:py-10">
          <div className="mx-auto max-w-5xl bg-white shadow-soft">
            <StaySearchForm
              isSearching={isSearching}
              onChange={setSearchState}
              onClose={() => setIsReservationOpen(false)}
              onSearch={searchFromHeader}
              value={searchState}
            />
            {searchError && (
              <p className="mx-6 mb-7 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:mx-12">
                {searchError}
              </p>
            )}
          </div>
        </div>
      )}

      <section
        className="relative isolate flex min-h-[32rem] items-end overflow-hidden border-b border-stone-200 md:min-h-[40rem]"
        id="top"
      >
        <Image
          alt="夜のホテルワセリコ外観"
          className="-z-20 object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/images/waseriko-hotel.png"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/15"
        />
        <div className="mx-auto w-full max-w-7xl px-5 py-12 md:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-semibold tracking-[0.28em] text-[#d8c497]">
              TOKYO STAY
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-normal text-white drop-shadow-sm md:text-6xl">
              静かな滞在を、確かな予約体験で。
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-8 text-white/90 md:text-base">
              右上の「ご予約」から宿泊日、人数、客室数を指定して空室を検索できます。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
