import type { ChatMessage, ChatThread, ChatThreadSummary } from "@/types/chat";

type ApiErrorResponse = {
  message?: string;
};

type ThreadsResponse = {
  threads: ChatThreadSummary[];
};

type ThreadResponse = {
  thread: ChatThread;
};

type MessageResponse = {
  message: ChatMessage;
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

export async function fetchGuestChat(
  confirmationCode: string,
  email: string,
): Promise<ChatThread> {
  const response = await fetch(
    `/api/chats/${encodeURIComponent(confirmationCode)}?email=${encodeURIComponent(email)}`,
  );
  if (!response.ok) throw await parseApiError(response, "チャットの取得に失敗しました。");
  return ((await response.json()) as ThreadResponse).thread;
}

export async function sendGuestChatMessage(
  confirmationCode: string,
  email: string,
  body: string,
): Promise<ChatMessage> {
  const response = await fetch(`/api/chats/${encodeURIComponent(confirmationCode)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, body }),
  });
  if (!response.ok) throw await parseApiError(response, "メッセージの送信に失敗しました。");
  return ((await response.json()) as MessageResponse).message;
}

export async function fetchHotelChatThreads(staffKey: string): Promise<ChatThreadSummary[]> {
  const response = await fetch("/api/chats", {
    headers: staffHeaders(staffKey),
  });
  if (!response.ok) throw await parseApiError(response, "チャット一覧の取得に失敗しました。");
  return ((await response.json()) as ThreadsResponse).threads;
}

export async function fetchHotelChat(
  confirmationCode: string,
  staffKey: string,
): Promise<ChatThread> {
  const response = await fetch(`/api/chats/${encodeURIComponent(confirmationCode)}`, {
    headers: staffHeaders(staffKey),
  });
  if (!response.ok) throw await parseApiError(response, "チャットの取得に失敗しました。");
  return ((await response.json()) as ThreadResponse).thread;
}

export async function sendHotelChatMessage(
  confirmationCode: string,
  staffKey: string,
  body: string,
): Promise<ChatMessage> {
  const response = await fetch(`/api/chats/${encodeURIComponent(confirmationCode)}`, {
    method: "POST",
    headers: staffHeaders(staffKey),
    body: JSON.stringify({ body }),
  });
  if (!response.ok) throw await parseApiError(response, "メッセージの送信に失敗しました。");
  return ((await response.json()) as MessageResponse).message;
}
