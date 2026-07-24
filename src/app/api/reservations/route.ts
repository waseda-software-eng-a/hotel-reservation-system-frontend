import { availabilityDao, reservationDao } from "@/app/api/dao";
import type { ReservationDraft } from "@/app/api/model/reservation";
import { toApiError } from "@/app/api/service/apiError";
import { ReservationService } from "@/app/api/service/reservationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const draft = (await request.json()) as ReservationDraft;
    const service = new ReservationService(reservationDao, availabilityDao);
    const reservation = await service.create(draft);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    const apiError = toApiError(error, "予約に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}
