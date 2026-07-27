"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchSiteContentPage,
  updateSiteContentPage,
  verifyHotelStaffKey,
} from "@/lib/siteContentApi";
import { HOTEL_STAFF_KEY_STORAGE } from "@/lib/hotelStaffSession";
import type { SiteContentItem, SiteContentPage, SiteContentSlug } from "@/types/siteContent";

const inputClass =
  "min-h-12 w-full border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-[#856c34] focus:ring-1 focus:ring-[#856c34]";
const labelClass = "grid gap-2 text-sm font-semibold text-stone-700";

function createEmptyItem(): SiteContentItem {
  return {
    id: `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    description: "",
    metaLabel: "",
  };
}

export default function HotelContentEditorPageTemplate({
  initialSlug = "shop",
}: {
  initialSlug?: SiteContentSlug;
}) {
  const [staffKeyInput, setStaffKeyInput] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<SiteContentSlug>(initialSlug);
  const [page, setPage] = useState<SiteContentPage | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const publicPath = useMemo(
    () => (selectedSlug === "shop" ? "/shop" : "/events"),
    [selectedSlug],
  );

  useEffect(() => {
    const saved = window.sessionStorage.getItem(HOTEL_STAFF_KEY_STORAGE) ?? "";
    if (saved) {
      setStaffKey(saved);
      setStaffKeyInput(saved);
    }
  }, []);

  useEffect(() => {
    if (!staffKey) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      setMessage("");
      try {
        const next = await fetchSiteContentPage(selectedSlug);
        if (cancelled) return;
        setPage(next);
        setTitle(next.title);
        setSubtitle(next.subtitle);
        setIntroduction(next.introduction);
        setItems(next.items.map((item) => ({ ...item })));
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
  }, [staffKey, selectedSlug]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const key = staffKeyInput.trim();
      await verifyHotelStaffKey(key);
      window.sessionStorage.setItem(HOTEL_STAFF_KEY_STORAGE, key);
      setStaffKey(key);
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "スタッフ認証に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    setStaffKey("");
    setStaffKeyInput("");
    setPage(null);
    window.sessionStorage.removeItem(HOTEL_STAFF_KEY_STORAGE);
  }

  function updateItem(index: number, patch: Partial<SiteContentItem>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!staffKey) return;
    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await updateSiteContentPage(selectedSlug, staffKey, {
        title,
        subtitle,
        introduction,
        items,
      });
      setPage(saved);
      setTitle(saved.title);
      setSubtitle(saved.subtitle);
      setIntroduction(saved.introduction);
      setItems(saved.items.map((item) => ({ ...item })));
      setMessage("保存しました。公開ページに反映されています。");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-24 max-w-6xl items-center justify-between px-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#856c34]">HOTEL DESK</p>
            <h1 className="mt-1 font-serif text-xl tracking-[0.08em]">コンテンツ編集</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            {staffKey && (
              <button
                className="text-sm text-stone-600 underline underline-offset-4"
                onClick={handleLogout}
                type="button"
              >
                ログアウト
              </button>
            )}
            <Link className="text-sm text-stone-600 underline underline-offset-4" href="/hotel/chats">
              チャット対応
            </Link>
            <Link className="text-sm text-[#856c34] underline underline-offset-4" href="/">
              ホテルサイトへ
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        {!staffKey ? (
          <form
            className="mx-auto max-w-md border border-stone-200 bg-white p-8 shadow-[0_8px_30px_rgba(26,21,10,0.05)]"
            onSubmit={handleLogin}
          >
            <p className="text-xs tracking-[0.2em] text-[#856c34]">STAFF LOGIN</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold">スタッフ認証</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              ホテルショップとイベントの掲載内容を編集するにはスタッフキーを入力してください。
            </p>
            {error && (
              <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <label className="mt-6 grid gap-2 text-sm font-semibold text-stone-700">
              スタッフキー
              <input
                className={inputClass}
                onChange={(event) => setStaffKeyInput(event.target.value)}
                required
                type="password"
                value={staffKeyInput}
              />
            </label>
            <button
              className="mt-6 min-h-12 w-full bg-[#856c34] px-8 text-sm font-bold text-white transition hover:bg-[#755f2d] disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "確認中…" : "入室する"}
            </button>
          </form>
        ) : (
          <div className="grid gap-6">
            <div className="flex flex-wrap gap-3">
              {(
                [
                  ["shop", "ホテルショップ"],
                  ["events", "イベント"],
                ] as const
              ).map(([slug, label]) => (
                <button
                  className={`min-h-11 px-5 text-sm font-bold transition ${
                    selectedSlug === slug
                      ? "bg-[#856c34] text-white"
                      : "border border-stone-300 bg-white text-stone-700 hover:bg-[#faf8f2]"
                  }`}
                  key={slug}
                  onClick={() => setSelectedSlug(slug)}
                  type="button"
                >
                  {label}
                </button>
              ))}
              <Link
                className="ml-auto flex min-h-11 items-center text-sm text-[#856c34] underline underline-offset-4"
                href={publicPath}
                target="_blank"
              >
                公開ページを見る
              </Link>
            </div>

            {(error || message) && (
              <p
                className={`border px-5 py-4 text-sm font-semibold ${
                  error
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-[#ccbe9f] bg-[#f7f3e9] text-[#6e592c]"
                }`}
              >
                {error || message}
              </p>
            )}

            {isLoading && !page ? (
              <p className="text-sm text-stone-500">読み込み中…</p>
            ) : (
              <form
                className="grid gap-6 border border-stone-200 bg-white p-6 md:p-8"
                onSubmit={handleSave}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <label className={labelClass}>
                    タイトル
                    <input
                      className={inputClass}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                      value={title}
                    />
                  </label>
                  <label className={labelClass}>
                    サブタイトル
                    <input
                      className={inputClass}
                      onChange={(event) => setSubtitle(event.target.value)}
                      required
                      value={subtitle}
                    />
                  </label>
                </div>
                <label className={labelClass}>
                  紹介文
                  <textarea
                    className="min-h-28 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#856c34] focus:ring-1 focus:ring-[#856c34]"
                    onChange={(event) => setIntroduction(event.target.value)}
                    required
                    value={introduction}
                  />
                </label>

                <div className="border-t border-stone-200 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-serif text-xl font-semibold">掲載項目</h2>
                    <button
                      className="min-h-11 border border-[#856c34] px-4 text-sm font-bold text-[#856c34]"
                      onClick={() => setItems((current) => [...current, createEmptyItem()])}
                      type="button"
                    >
                      項目を追加
                    </button>
                  </div>

                  <div className="mt-5 grid gap-5">
                    {items.length === 0 ? (
                      <p className="text-sm text-stone-500">項目がありません。追加してください。</p>
                    ) : (
                      items.map((item, index) => (
                        <div className="border border-stone-200 p-5" key={item.id}>
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold tracking-[0.16em] text-stone-500">
                              ITEM {index + 1}
                            </p>
                            <button
                              className="text-sm text-red-700 underline underline-offset-4"
                              onClick={() =>
                                setItems((current) =>
                                  current.filter((_, itemIndex) => itemIndex !== index),
                                )
                              }
                              type="button"
                            >
                              削除
                            </button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className={labelClass}>
                              タイトル
                              <input
                                className={inputClass}
                                onChange={(event) =>
                                  updateItem(index, { title: event.target.value })
                                }
                                required
                                value={item.title}
                              />
                            </label>
                            <label className={labelClass}>
                              補足（価格・日時など）
                              <input
                                className={inputClass}
                                onChange={(event) =>
                                  updateItem(index, { metaLabel: event.target.value })
                                }
                                value={item.metaLabel}
                              />
                            </label>
                          </div>
                          <label className={`${labelClass} mt-4`}>
                            説明
                            <textarea
                              className="min-h-24 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#856c34] focus:ring-1 focus:ring-[#856c34]"
                              onChange={(event) =>
                                updateItem(index, { description: event.target.value })
                              }
                              required
                              value={item.description}
                            />
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-6">
                  <p className="mr-auto self-center text-xs text-stone-500">
                    {page
                      ? `最終更新: ${new Date(page.updatedAt).toLocaleString("ja-JP")}`
                      : ""}
                  </p>
                  <button
                    className="min-h-12 bg-[#856c34] px-8 text-sm font-bold text-white disabled:opacity-50"
                    disabled={isSaving}
                    type="submit"
                  >
                    {isSaving ? "保存中…" : "公開内容を保存"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
