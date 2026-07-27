import type { SiteContentDao } from "@/app/api/dao/siteContentDao";
import { badRequest, notFound } from "@/app/api/service/apiError";
import type {
  SiteContentDraft,
  SiteContentPage,
  SiteContentSlug,
} from "@/types/siteContent";
import { isSiteContentSlug } from "@/types/siteContent";

export class SiteContentService {
  constructor(private readonly siteContentDao: SiteContentDao) {}

  parseSlug(value: string): SiteContentSlug {
    if (!isSiteContentSlug(value)) {
      throw badRequest("対象ページが正しくありません。");
    }
    return value;
  }

  private validateDraft(draft: SiteContentDraft): SiteContentDraft {
    if (!draft.title?.trim()) throw badRequest("タイトルを入力してください。");
    if (!draft.subtitle?.trim()) throw badRequest("サブタイトルを入力してください。");
    if (!draft.introduction?.trim()) throw badRequest("紹介文を入力してください。");
    if (!Array.isArray(draft.items)) throw badRequest("掲載項目を確認してください。");

    if (draft.title.trim().length > 80) {
      throw badRequest("タイトルは80文字以内で入力してください。");
    }
    if (draft.subtitle.trim().length > 80) {
      throw badRequest("サブタイトルは80文字以内で入力してください。");
    }
    if (draft.introduction.trim().length > 1000) {
      throw badRequest("紹介文は1000文字以内で入力してください。");
    }
    if (draft.items.length > 20) {
      throw badRequest("掲載項目は20件までです。");
    }

    for (const [index, item] of draft.items.entries()) {
      if (!item.title?.trim()) {
        throw badRequest(`掲載項目${index + 1}のタイトルを入力してください。`);
      }
      if (!item.description?.trim()) {
        throw badRequest(`掲載項目${index + 1}の説明を入力してください。`);
      }
      if (item.title.trim().length > 80 || item.description.trim().length > 500) {
        throw badRequest(`掲載項目${index + 1}の文字数を確認してください。`);
      }
      if ((item.metaLabel ?? "").trim().length > 80) {
        throw badRequest(`掲載項目${index + 1}の補足は80文字以内で入力してください。`);
      }
    }

    return {
      title: draft.title,
      subtitle: draft.subtitle,
      introduction: draft.introduction,
      items: draft.items,
    };
  }

  async getPage(slug: string): Promise<SiteContentPage> {
    const parsed = this.parseSlug(slug);
    try {
      return await this.siteContentDao.getPage(parsed);
    } catch (error) {
      if (error instanceof Error && error.message === "PAGE_NOT_FOUND") {
        throw notFound("ページが見つかりません。");
      }
      throw error;
    }
  }

  async listPages(): Promise<SiteContentPage[]> {
    return this.siteContentDao.listPages();
  }

  async updatePage(slug: string, draft: SiteContentDraft): Promise<SiteContentPage> {
    const parsed = this.parseSlug(slug);
    const validated = this.validateDraft(draft);
    try {
      return await this.siteContentDao.updatePage(parsed, validated);
    } catch (error) {
      if (error instanceof Error && error.message === "PAGE_NOT_FOUND") {
        throw notFound("ページが見つかりません。");
      }
      throw error;
    }
  }
}
