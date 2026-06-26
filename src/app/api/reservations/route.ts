import { reservationDao, roomDao } from "@/app/api/dao";
import type { ReservationDraft } from "@/app/api/model/reservation";
import { ReservationService } from "@/app/api/service/reservationService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const draft = (await request.json()) as ReservationDraft;
    const service = new ReservationService(reservationDao, roomDao);
    const reservation = await service.create(draft);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "予約に失敗しました。" },
      { status: 400 },
    );
  }
}
