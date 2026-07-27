"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatSender } from "@/types/chat";

const POLL_INTERVAL_MS = 3000;

type ChatPanelProps = {
  title?: string;
  selfSender: ChatSender;
  messages: ChatMessage[];
  isLoading?: boolean;
  error?: string;
  onSend: (body: string) => Promise<void>;
  onRefresh: () => Promise<void>;
};

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

export default function ChatPanel({
  title = "ホテルとのチャット",
  selfSender,
  messages,
  isLoading = false,
  error = "",
  onSend,
  onRefresh,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void onRefreshRef.current();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || isSending) return;
    setSendError("");
    setIsSending(true);
    try {
      await onSend(draft.trim());
      setDraft("");
    } catch (submitError) {
      setSendError(
        submitError instanceof Error ? submitError.message : "メッセージの送信に失敗しました。",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="border border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 md:px-6">
        <div>
          <p className="text-xs tracking-[0.2em] text-[#856c34]">CHAT</p>
          <h3 className="mt-1 font-serif text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-xs text-stone-500">自動更新中</p>
      </div>

      {(error || sendError) && (
        <p className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
          {error || sendError}
        </p>
      )}

      <div className="max-h-[28rem] space-y-3 overflow-y-auto bg-[#faf9f6] px-4 py-5 md:px-6">
        {isLoading && messages.length === 0 ? (
          <p className="text-sm text-stone-500">読み込み中…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-stone-500">
            まだメッセージはありません。内容を入力して送信してください。
          </p>
        ) : (
          messages.map((message) => {
            const isSelf = message.sender === selfSender;
            return (
              <div
                className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                key={message.id}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm leading-6 ${
                    isSelf
                      ? "bg-[#856c34] text-white"
                      : "border border-stone-200 bg-white text-stone-800"
                  }`}
                >
                  <p className={`text-[11px] ${isSelf ? "text-white/80" : "text-stone-500"}`}>
                    {message.sender === "guest" ? "お客様" : "ホテル"} ・{" "}
                    {formatTime(message.createdAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="flex gap-3 border-t border-stone-200 p-4 md:p-5" onSubmit={handleSubmit}>
        <input
          className="min-h-12 flex-1 border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-[#856c34] focus:ring-1 focus:ring-[#856c34]"
          maxLength={1000}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="メッセージを入力"
          value={draft}
        />
        <button
          className="min-h-12 bg-[#856c34] px-6 text-sm font-bold text-white transition hover:bg-[#755f2d] disabled:opacity-50"
          disabled={isSending || !draft.trim()}
          type="submit"
        >
          {isSending ? "送信中…" : "送信"}
        </button>
      </form>
    </section>
  );
}
