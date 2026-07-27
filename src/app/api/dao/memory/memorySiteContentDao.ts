import type { SiteContentDao } from "@/app/api/dao/siteContentDao";
import type {
  SiteContentDraft,
  SiteContentItem,
  SiteContentPage,
  SiteContentSlug,
} from "@/types/siteContent";

type ContentStore = {
  pages: Map<SiteContentSlug, SiteContentPage>;
};

const globalForContent = globalThis as typeof globalThis & {
  __hotelSiteContentStoreV1?: ContentStore;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clonePage(page: SiteContentPage): SiteContentPage {
  return {
    ...page,
    items: page.items.map((item) => ({ ...item })),
  };
}

function seedPages(): Map<SiteContentSlug, SiteContentPage> {
  const now = new Date().toISOString();
  const pages = new Map<SiteContentSlug, SiteContentPage>();

  pages.set("shop", {
    slug: "shop",
    menuLabel: "ホテルショップ",
    title: "ホテルショップ",
    subtitle: "HOTEL SHOP",
    introduction:
      "旅の思い出や、日常使いのお土産を揃えています。季節の限定品もご用意しています。",
    updatedAt: now,
    items: [
      {
        id: "shop_1",
        title: "ワセリコブレンドコーヒー",
        description: "フロント近くのショップで焙煎したオリジナルブレンドです。",
        metaLabel: "1,800円",
      },
      {
        id: "shop_2",
        title: "オリジナルルームフレグランス",
        description: "客室でもお使いいただいている、落ち着いた香りのフレグランスです。",
        metaLabel: "3,200円",
      },
    ],
  });

  pages.set("events", {
    slug: "events",
    menuLabel: "イベント",
    title: "イベント",
    subtitle: "EVENTS",
    introduction:
      "季節ごとのコンサートやワークショップなど、ホテルで開催するイベントをご案内します。",
    updatedAt: now,
    items: [
      {
        id: "event_1",
        title: "ロビーラウンジ ジャズナイト",
        description: "金曜夜にアコースティックジャズをお楽しみいただけます。予約不要です。",
        metaLabel: "毎週金曜 19:00〜",
      },
      {
        id: "event_2",
        title: "アフタヌーンティー体験",
        description: "パティシエによる季節のスイーツとお茶のペアリング体験です。",
        metaLabel: "土日祝 14:00〜",
      },
    ],
  });

  return pages;
}

function getStore(): ContentStore {
  if (!globalForContent.__hotelSiteContentStoreV1) {
    globalForContent.__hotelSiteContentStoreV1 = { pages: seedPages() };
  }
  return globalForContent.__hotelSiteContentStoreV1;
}

function normalizeItems(items: SiteContentItem[]): SiteContentItem[] {
  return items.map((item, index) => ({
    id: item.id?.trim() || createId(`item${index}`),
    title: item.title.trim(),
    description: item.description.trim(),
    metaLabel: item.metaLabel.trim(),
  }));
}

export class MemorySiteContentDao implements SiteContentDao {
  async getPage(slug: SiteContentSlug): Promise<SiteContentPage> {
    const page = getStore().pages.get(slug);
    if (!page) {
      throw new Error("PAGE_NOT_FOUND");
    }
    return clonePage(page);
  }

  async listPages(): Promise<SiteContentPage[]> {
    const store = getStore();
    return ["shop", "events"].map((slug) => clonePage(store.pages.get(slug as SiteContentSlug)!));
  }

  async updatePage(slug: SiteContentSlug, draft: SiteContentDraft): Promise<SiteContentPage> {
    const store = getStore();
    const existing = store.pages.get(slug);
    if (!existing) {
      throw new Error("PAGE_NOT_FOUND");
    }

    const updated: SiteContentPage = {
      ...existing,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      introduction: draft.introduction.trim(),
      items: normalizeItems(draft.items),
      updatedAt: new Date().toISOString(),
    };
    store.pages.set(slug, updated);
    return clonePage(updated);
  }
}
