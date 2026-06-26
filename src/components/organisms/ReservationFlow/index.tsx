"use client";

import GuestInfoForm from "@/components/molecules/GuestInfoForm";
import ReservationSteps from "@/components/molecules/ReservationSteps";
import RoomOptionCard from "@/components/molecules/RoomOptionCard";
import StaySearchForm from "@/components/molecules/StaySearchForm";
import { useReservationFlow } from "@/hooks/useReservationFlow";

export default function ReservationFlow() {
  const {
    error,
    guestInfo,
    handleReserve,
    handleSearch,
    isSearching,
    isSubmitting,
    reservation,
    rooms,
    searchState,
    selectedRoom,
    selectedRoomId,
    setGuestInfo,
    setSearchState,
    setSelectedRoomId,
  } = useReservationFlow();

  const currentStep = selectedRoom ? 3 : rooms.length > 0 ? 2 : 1;

  return (
    <div className="grid gap-6">
      <ReservationSteps currentStep={currentStep} />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {reservation && (
        <section className="rounded-lg border border-teal-200 bg-teal-50 p-5">
          <p className="text-sm font-semibold text-ocean">予約が完了しました</p>
          <h2 className="mt-2 text-xl font-bold">予約番号: {reservation.id}</h2>
          <p className="mt-2 text-sm text-slate-600">
            確認メールを {reservation.guestInfo.email} に送信する想定です。
          </p>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold text-ocean">Step 1</p>
          <h2 className="mt-1 text-xl font-bold">宿泊日と人数を入力</h2>
        </div>
        <StaySearchForm
          isSearching={isSearching}
          onChange={setSearchState}
          onSearch={handleSearch}
          value={searchState}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold text-ocean">Step 2</p>
          <h2 className="mt-1 text-xl font-bold">空室から部屋を選択</h2>
        </div>
        {rooms.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {rooms.map((room) => (
              <RoomOptionCard
                isSelected={room.id === selectedRoomId}
                key={room.id}
                onSelect={setSelectedRoomId}
                room={room}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500">
            宿泊条件を入力して空室を検索してください。
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold text-ocean">Step 3</p>
          <h2 className="mt-1 text-xl font-bold">利用者情報を入力</h2>
        </div>
        <GuestInfoForm
          disabled={!selectedRoom}
          guestInfo={guestInfo}
          isSubmitting={isSubmitting}
          onChange={setGuestInfo}
          onSubmit={handleReserve}
        />
      </section>
    </div>
  );
}
