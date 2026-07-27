import type { SiteContentDraft, SiteContentPage, SiteContentSlug } from "@/types/siteContent";

export type SiteContentDao = {
  getPage(slug: SiteContentSlug): Promise<SiteContentPage>;
  updatePage(slug: SiteContentSlug, draft: SiteContentDraft): Promise<SiteContentPage>;
  listPages(): Promise<SiteContentPage[]>;
};
