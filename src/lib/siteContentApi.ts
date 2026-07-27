import type { SiteContentDraft, SiteContentPage } from "@/types/siteContent";

type ApiErrorResponse = {
  message?: string;
};

type PageResponse = {
  page: SiteContentPage;
};

type PagesResponse = {
  pages: SiteContentPage[];
};

async function parseApiError(response: Response, fallbackMessage: string): Promise<Error> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorResponse;
  return new Error(body.message ?? fallbackMessage);
}

function staffHeaders(staffKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-hotel-staff-key": staffKey,
  };
}

export async function fetchSiteContentPage(slug: string): Promise<SiteContentPage> {
  const response = await fetch(`/api/contents/${encodeURIComponent(slug)}`);
  if (!response.ok) throw await parseApiError(response, "コンテンツの取得に失敗しました。");
  return ((await response.json()) as PageResponse).page;
}

export async function fetchSiteContentPages(): Promise<SiteContentPage[]> {
  const response = await fetch("/api/contents");
  if (!response.ok) throw await parseApiError(response, "コンテンツ一覧の取得に失敗しました。");
  return ((await response.json()) as PagesResponse).pages;
}

export async function verifyHotelStaffKey(staffKey: string): Promise<void> {
  const response = await fetch("/api/contents", {
    method: "POST",
    headers: staffHeaders(staffKey),
  });
  if (!response.ok) throw await parseApiError(response, "スタッフ認証に失敗しました。");
}

export async function updateSiteContentPage(
  slug: string,
  staffKey: string,
  draft: SiteContentDraft,
): Promise<SiteContentPage> {
  const response = await fetch(`/api/contents/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: staffHeaders(staffKey),
    body: JSON.stringify(draft),
  });
  if (!response.ok) throw await parseApiError(response, "コンテンツの保存に失敗しました。");
  return ((await response.json()) as PageResponse).page;
}
