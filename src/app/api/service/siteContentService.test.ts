import { describe, expect, test } from "bun:test";
import { MemorySiteContentDao } from "@/app/api/dao/memory/memorySiteContentDao";
import { SiteContentService } from "@/app/api/service/siteContentService";

describe("SiteContentService", () => {
  test("updates shop page contents", async () => {
    const service = new SiteContentService(new MemorySiteContentDao());
    const saved = await service.updatePage("shop", {
      title: "ショップ更新",
      subtitle: "SHOP",
      introduction: "紹介文を更新しました。",
      items: [
        {
          id: "item_1",
          title: "限定スイーツ",
          description: "週末限定の焼き菓子セットです。",
          metaLabel: "2,400円",
        },
      ],
    });

    expect(saved.title).toBe("ショップ更新");
    expect(saved.items).toHaveLength(1);

    const loaded = await service.getPage("shop");
    expect(loaded.title).toBe("ショップ更新");
    expect(loaded.items[0]?.title).toBe("限定スイーツ");
  });
});
