import { siteContentDao } from "@/app/api/dao";
import { toApiError } from "@/app/api/service/apiError";
import { assertHotelStaff } from "@/app/api/service/hotelStaffAuth";
import { SiteContentService } from "@/app/api/service/siteContentService";
import type { SiteContentDraft } from "@/types/siteContent";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  try {
    const service = new SiteContentService(siteContentDao);
    const page = await service.getPage(slug);
    return NextResponse.json({ page });
  } catch (error) {
    const apiError = toApiError(error, "コンテンツの取得に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  try {
    assertHotelStaff(request);
    const draft = (await request.json()) as SiteContentDraft;
    const service = new SiteContentService(siteContentDao);
    const page = await service.updatePage(slug, draft);
    return NextResponse.json({ page });
  } catch (error) {
    const apiError = toApiError(error, "コンテンツの保存に失敗しました。");
    return NextResponse.json({ message: apiError.message }, { status: apiError.status });
  }
}
