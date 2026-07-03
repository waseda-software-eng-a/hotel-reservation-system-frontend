import type {
  AvailabilitySearchParams,
  AvailablePlan,
  Reservation,
  ReservationDetails,
  ReservationDraft,
  ReservationUpdateDraft,
} from "@/types/reservation";

type AvailabilityResponse = {
  plans: AvailablePlan[];
};

type ReservationResponse = {
  reservation: Reservation;
};

type ReservationDetailsResponse = {
  reservation: ReservationDetails;
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

export async function findReservation(
  confirmationCode: string,
  email: string,
): Promise<ReservationDetails> {
  const response = await fetch(
    `/api/reservations/${encodeURIComponent(confirmationCode)}?email=${encodeURIComponent(email)}`,
  );
  if (!response.ok) throw await parseApiError(response, "予約の取得に失敗しました。");
  return ((await response.json()) as ReservationDetailsResponse).reservation;
}

export async function updateReservation(
  draft: ReservationUpdateDraft,
): Promise<ReservationDetails> {
  const response = await fetch(`/api/reservations/${encodeURIComponent(draft.confirmationCode)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  if (!response.ok) throw await parseApiError(response, "予約の変更に失敗しました。");
  return ((await response.json()) as ReservationDetailsResponse).reservation;
}

export async function cancelReservation(
  confirmationCode: string,
  email: string,
): Promise<ReservationDetails> {
  const response = await fetch(`/api/reservations/${encodeURIComponent(confirmationCode)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw await parseApiError(response, "予約のキャンセルに失敗しました。");
  return ((await response.json()) as ReservationDetailsResponse).reservation;
}
