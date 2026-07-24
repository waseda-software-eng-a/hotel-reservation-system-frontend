import { availabilityDao, reservationDao } from "@/app/api/dao";
import type { ReservationUpdateDraft } from "@/app/api/model/reservation";
import { toApiError } from "@/app/api/service/apiError";
import { ReservationService } from "@/app/api/service/reservationService";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ confirmationCode: string }> };

function errorResponse(error: unknown, fallback: string) {
  const apiError = toApiError(error, fallback);
  return NextResponse.json({ message: apiError.message }, { status: apiError.status });
}

export async function GET(request: Request, context: RouteContext) {
  const { confirmationCode } = await context.params;
  const email = new URL(request.url).searchParams.get("email") ?? "";

  try {
    const service = new ReservationService(reservationDao, availabilityDao);
    const reservation = await service.find({ confirmationCode, email });
    return NextResponse.json({ reservation });
  } catch (error) {
    return errorResponse(error, "予約の取得に失敗しました。");
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { confirmationCode } = await context.params;

  try {
    const body = (await request.json()) as Omit<ReservationUpdateDraft, "confirmationCode">;
    const service = new ReservationService(reservationDao, availabilityDao);
    const reservation = await service.update({ ...body, confirmationCode });
    return NextResponse.json({ reservation });
  } catch (error) {
    return errorResponse(error, "予約の変更に失敗しました。");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { confirmationCode } = await context.params;

  try {
    const body = (await request.json()) as { email?: string };
    const service = new ReservationService(reservationDao, availabilityDao);
    const reservation = await service.cancel({ confirmationCode, email: body.email ?? "" });
    return NextResponse.json({ reservation });
  } catch (error) {
    return errorResponse(error, "予約のキャンセルに失敗しました。");
  }
}
