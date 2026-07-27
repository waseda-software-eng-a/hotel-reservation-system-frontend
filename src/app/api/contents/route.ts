import { siteContentDao } from "@/app/api/dao";
import { toApiError } from "@/app/api/service/apiError";
import { assertHotelStaff } from "@/app/api/service/hotelStaffAuth";
import { SiteContentService } from "@/app/api/service/siteContentService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const service = new SiteContentService(siteContentDao);
    const pages = await service.listPages();
    return NextResponse.json({ pages });
  } catch (error) {
    const apiError = toApiError(error, "コンテンツ一覧の取得に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}

export async function POST(request: Request) {
  // Lightweight staff key check endpoint used by hotel content console login.
  try {
    assertHotelStaff(request);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const apiError = toApiError(error, "スタッフ認証に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}
