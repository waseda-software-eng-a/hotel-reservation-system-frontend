"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HotelSiteHeader from "@/components/organisms/HotelSiteHeader";
import { fetchSiteContentPage } from "@/lib/siteContentApi";
import type { SiteContentPage, SiteContentSlug } from "@/types/siteContent";

type SiteContentPageTemplateProps = {
  slug: SiteContentSlug;
};

export default function SiteContentPageTemplate({ slug }: SiteContentPageTemplateProps) {
  const router = useRouter();
  const [page, setPage] = useState<SiteContentPage | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const next = await fetchSiteContentPage(slug);
        if (!cancelled) setPage(next);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "コンテンツの取得に失敗しました。",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">
      <HotelSiteHeader onReservationOpen={() => router.push("/")} />

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="text-xs tracking-[0.24em] text-[#856c34]">
            {page?.subtitle ?? (slug === "shop" ? "HOTEL SHOP" : "EVENTS")}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
            {page?.title ?? (slug === "shop" ? "ホテルショップ" : "イベント")}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
            {page?.introduction ??
              (isLoading ? "読み込み中…" : "コンテンツを準備しています。")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        {error && (
          <p className="mb-7 border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {isLoading && !page ? (
          <p className="text-sm text-stone-500">読み込み中…</p>
        ) : (
          <div className="grid gap-5">
            {(page?.items ?? []).map((item) => (
              <article className="border border-stone-200 bg-white p-6 md:p-8" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-serif text-xl font-semibold">{item.title}</h2>
                  {item.metaLabel && (
                    <p className="text-sm font-semibold text-[#856c34]">{item.metaLabel}</p>
                  )}
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-600">{item.description}</p>
              </article>
            ))}
            {(page?.items.length ?? 0) === 0 && (
              <p className="border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">
                現在掲載中の項目はありません。
              </p>
            )}
          </div>
        )}

        <div className="mt-10">
          <Link className="text-sm text-[#856c34] underline underline-offset-4" href="/">
            ホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
