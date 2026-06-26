import { roomDao } from "@/app/api/dao";
import type { AvailabilitySearchParams } from "@/app/api/model/reservation";
import { AvailabilityService } from "@/app/api/service/availabilityService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: AvailabilitySearchParams = {
    checkInDate: searchParams.get("checkInDate") ?? "",
    checkOutDate: searchParams.get("checkOutDate") ?? "",
    guests: Number(searchParams.get("guests") ?? "0"),
  };

  try {
    const service = new AvailabilityService(roomDao);
    const rooms = await service.search(params);
    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "空室検索に失敗しました。" },
      { status: 400 },
    );
  }
}
