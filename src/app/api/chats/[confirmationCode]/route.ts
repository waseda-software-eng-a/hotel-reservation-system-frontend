import { chatDao } from "@/app/api/dao";
import { badRequest, toApiError } from "@/app/api/service/apiError";
import { ChatService } from "@/app/api/service/chatService";
import { assertHotelStaff, getExpectedHotelStaffKey } from "@/app/api/service/hotelStaffAuth";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ confirmationCode: string }>;
};

function isHotelRequest(request: Request): boolean {
  const key = request.headers.get("x-hotel-staff-key")?.trim() ?? "";
  return Boolean(key) && key === getExpectedHotelStaffKey();
}

export async function GET(request: Request, context: RouteContext) {
  const { confirmationCode } = await context.params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";

  try {
    const service = new ChatService(chatDao);
    if (isHotelRequest(request)) {
      const thread = await service.getThreadForHotel(confirmationCode);
      return NextResponse.json({ thread });
    }

    const thread = await service.getThreadForGuest(confirmationCode, email);
    return NextResponse.json({ thread });
  } catch (error) {
    const apiError = toApiError(error, "チャットの取得に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { confirmationCode } = await context.params;

  try {
    const body = (await request.json()) as { email?: string; body?: string };
    const service = new ChatService(chatDao);

    if (isHotelRequest(request)) {
      assertHotelStaff(request);
      const message = await service.sendHotelMessage(confirmationCode, body.body ?? "");
      return NextResponse.json({ message }, { status: 201 });
    }

    if (!body.email) {
      throw badRequest("メールアドレスを入力してください。");
    }
    const message = await service.sendGuestMessage(
      confirmationCode,
      body.email,
      body.body ?? "",
    );
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const apiError = toApiError(error, "メッセージの送信に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}
