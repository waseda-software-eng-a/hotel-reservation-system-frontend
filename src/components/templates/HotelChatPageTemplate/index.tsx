"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ChatPanel from "@/components/organisms/ChatPanel";
import {
  fetchHotelChat,
  fetchHotelChatThreads,
  sendHotelChatMessage,
} from "@/lib/chatApi";
import { HOTEL_STAFF_KEY_STORAGE } from "@/lib/hotelStaffSession";
import type { ChatMessage, ChatThreadSummary } from "@/types/chat";

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function HotelChatPageTemplate() {
  const [staffKeyInput, setStaffKeyInput] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [threads, setThreads] = useState<ChatThreadSummary[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [guestEmail, setGuestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.sessionStorage.getItem(HOTEL_STAFF_KEY_STORAGE) ?? "";
    if (saved) {
      setStaffKey(saved);
      setStaffKeyInput(saved);
    }
  }, []);

  const refreshThreads = useCallback(async (key: string) => {
    const nextThreads = await fetchHotelChatThreads(key);
    setThreads(nextThreads);
  }, []);

  const loadThread = useCallback(async (key: string, confirmationCode: string) => {
    setIsThreadLoading(true);
    try {
      const thread = await fetchHotelChat(confirmationCode, key);
      setSelectedCode(thread.confirmationCode);
      setMessages(thread.messages);
      setGuestEmail(thread.guestEmail);
      setError("");
    } finally {
      setIsThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!staffKey) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        await refreshThreads(staffKey);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "チャット一覧の取得に失敗しました。",
          );
          setStaffKey("");
          window.sessionStorage.removeItem(HOTEL_STAFF_KEY_STORAGE);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [staffKey, refreshThreads]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const key = staffKeyInput.trim();
      await refreshThreads(key);
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
    setThreads([]);
    setSelectedCode(null);
    setMessages([]);
    setGuestEmail("");
    window.sessionStorage.removeItem(HOTEL_STAFF_KEY_STORAGE);
  }

  async function handleSelectThread(thread: ChatThreadSummary) {
    if (!staffKey) return;
    setGuestEmail(thread.guestEmail);
    setSelectedCode(thread.confirmationCode);
    setMessages([]);
    try {
      await loadThread(staffKey, thread.confirmationCode);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "チャットの取得に失敗しました。");
    }
  }

  const refreshPanel = useCallback(async () => {
    if (!staffKey || !selectedCode) return;
    const thread = await fetchHotelChat(selectedCode, staffKey);
    setMessages(thread.messages);
    setGuestEmail(thread.guestEmail);
    await refreshThreads(staffKey);
  }, [staffKey, selectedCode, refreshThreads]);

  async function handleSend(body: string) {
    if (!staffKey || !selectedCode) return;
    await sendHotelChatMessage(selectedCode, staffKey, body);
    await refreshPanel();
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-24 max-w-6xl items-center justify-between px-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#856c34]">HOTEL DESK</p>
            <h1 className="mt-1 font-serif text-xl tracking-[0.08em]">チャット対応</h1>
          </div>
          <div className="flex items-center gap-4">
            {staffKey && (
              <button
                className="text-sm text-stone-600 underline underline-offset-4"
                onClick={handleLogout}
                type="button"
              >
                ログアウト
              </button>
            )}
            <Link className="text-sm text-stone-600 underline underline-offset-4" href="/hotel/contents">
              コンテンツ編集
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
              ホテル側チャットを開くにはスタッフキーを入力してください。
            </p>
            {error && (
              <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <label className="mt-6 grid gap-2 text-sm font-semibold text-stone-700">
              スタッフキー
              <input
                className="min-h-12 border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-[#856c34] focus:ring-1 focus:ring-[#856c34]"
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
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <aside className="border border-stone-200 bg-white">
              <div className="border-b border-stone-200 px-5 py-4">
                <h2 className="font-serif text-lg font-semibold">会話一覧</h2>
                <p className="mt-1 text-xs text-stone-500">
                  {threads.length} 件
                  {threads.reduce((sum, thread) => sum + thread.unreadForHotel, 0) > 0 && (
                    <span className="ml-2 font-semibold text-[#856c34]">
                      未読 {threads.reduce((sum, thread) => sum + thread.unreadForHotel, 0)}
                    </span>
                  )}
                </p>
              </div>
              <ul className="divide-y divide-stone-200">
                {threads.length === 0 ? (
                  <li className="px-5 py-6 text-sm text-stone-500">まだ会話はありません。</li>
                ) : (
                  threads.map((thread) => (
                    <li key={thread.confirmationCode}>
                      <button
                        className={`w-full px-5 py-4 text-left transition hover:bg-[#faf8f2] ${
                          selectedCode === thread.confirmationCode ? "bg-[#f7f3e9]" : ""
                        }`}
                        onClick={() => void handleSelectThread(thread)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold">{thread.confirmationCode}</p>
                          {thread.unreadForHotel > 0 && (
                            <span className="shrink-0 bg-[#856c34] px-2 py-0.5 text-[11px] font-bold text-white">
                              未読 {thread.unreadForHotel}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-stone-500">{thread.guestEmail}</p>
                        <p
                          className={`mt-2 line-clamp-2 text-xs leading-5 ${
                            thread.unreadForHotel > 0
                              ? "font-semibold text-stone-800"
                              : "text-stone-600"
                          }`}
                        >
                          {thread.lastMessage?.body ?? "メッセージなし"}
                        </p>
                        <p className="mt-2 text-[11px] text-stone-400">
                          {formatTime(thread.updatedAt)}
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </aside>

            <div>
              {error && (
                <p className="mb-5 border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}
              {!selectedCode ? (
                <div className="border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-sm text-stone-500">
                  左の一覧から会話を選んでください。
                </div>
              ) : (
                <ChatPanel
                  isLoading={isThreadLoading}
                  messages={messages}
                  onRefresh={refreshPanel}
                  onSend={handleSend}
                  selfSender="hotel"
                  title={`${selectedCode}（${guestEmail}）`}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
