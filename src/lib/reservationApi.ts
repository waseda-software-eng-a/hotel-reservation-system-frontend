import type {
  AvailabilitySearchParams,
  AvailablePlan,
  Reservation,
  ReservationDraft,
} from "@/types/reservation";

type AvailabilityResponse = {
  plans: AvailablePlan[];
};

type ReservationResponse = {
  reservation: Reservation;
};

type ApiErrorResponse = {
  message?: string;
};

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  return new Error(body.message ?? fallbackMessage);
}

export async function searchAvailablePlans(
  params: AvailabilitySearchParams,
): Promise<AvailablePlan[]> {
  const searchParams = new URLSearchParams({
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    adults: String(params.adults),
    children: String(params.children),
    roomCount: String(params.roomCount),
  });

  const response = await fetch(`/api/rooms/availability?${searchParams.toString()}`);
  if (!response.ok) {
    throw await parseApiError(response, "空室検索に失敗しました。");
  }

  const data = (await response.json()) as AvailabilityResponse;
  return data.plans;
}

export async function createReservation(draft: ReservationDraft): Promise<Reservation> {
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  });

  if (!response.ok) {
    throw await parseApiError(response, "予約に失敗しました。");
  }

  const data = (await response.json()) as ReservationResponse;
  return data.reservation;
}
