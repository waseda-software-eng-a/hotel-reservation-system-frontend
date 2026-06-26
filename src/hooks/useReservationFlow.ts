"use client";

import { useMemo, useState } from "react";
import { createReservation, searchAvailableRooms } from "@/lib/reservationApi";
import type {
  AvailabilitySearchParams,
  AvailableRoom,
  GuestInfo,
  Reservation,
} from "@/types/reservation";

type SearchState = AvailabilitySearchParams;

const initialSearchState: SearchState = {
  checkInDate: "",
  checkOutDate: "",
  guests: 2,
};

const initialGuestInfo: GuestInfo = {
  fullName: "",
  email: "",
  phone: "",
};

export function useReservationFlow() {
  const [searchState, setSearchState] = useState<SearchState>(initialSearchState);
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(initialGuestInfo);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  async function handleSearch() {
    setError("");
    setReservation(null);
    setSelectedRoomId("");
    setIsSearching(true);

    try {
      const availableRooms = await searchAvailableRooms(searchState);
      setRooms(availableRooms);
      if (availableRooms.length === 0) {
        setError("条件に一致する空室がありません。日程または人数を変更してください。");
      }
    } catch (searchError) {
      setRooms([]);
      setError(searchError instanceof Error ? searchError.message : "空室検索に失敗しました。");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleReserve() {
    if (!selectedRoom) {
      setError("部屋を選択してください。");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const createdReservation = await createReservation({
        roomId: selectedRoom.id,
        checkInDate: searchState.checkInDate,
        checkOutDate: searchState.checkOutDate,
        guests: searchState.guests,
        guestInfo,
      });
      setReservation(createdReservation);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "予約に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    error,
    guestInfo,
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
    handleReserve,
    handleSearch,
  };
}
