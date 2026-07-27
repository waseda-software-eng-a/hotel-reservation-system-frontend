export type SiteContentSlug = "shop" | "events";

export type SiteContentItem = {
  id: string;
  title: string;
  description: string;
  metaLabel: string;
};

export type SiteContentPage = {
  slug: SiteContentSlug;
  menuLabel: string;
  title: string;
  subtitle: string;
  introduction: string;
  items: SiteContentItem[];
  updatedAt: string;
};

export type SiteContentDraft = {
  title: string;
  subtitle: string;
  introduction: string;
  items: SiteContentItem[];
};

export const SITE_CONTENT_SLUGS: SiteContentSlug[] = ["shop", "events"];

export function isSiteContentSlug(value: string): value is SiteContentSlug {
  return value === "shop" || value === "events";
}
