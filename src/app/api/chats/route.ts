import { chatDao } from "@/app/api/dao";
import { toApiError } from "@/app/api/service/apiError";
import { ChatService } from "@/app/api/service/chatService";
import { assertHotelStaff } from "@/app/api/service/hotelStaffAuth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    assertHotelStaff(request);
    const service = new ChatService(chatDao);
    const threads = await service.listThreadsForHotel();
    return NextResponse.json({ threads });
  } catch (error) {
    const apiError = toApiError(error, "チャット一覧の取得に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}
