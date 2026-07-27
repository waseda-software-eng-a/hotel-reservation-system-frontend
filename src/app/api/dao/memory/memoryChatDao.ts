import type { ChatDao } from "@/app/api/dao/chatDao";
import type { ChatMessage, ChatSender, ChatThread, ChatThreadSummary } from "@/types/chat";

type StoredThread = {
  confirmationCode: string;
  guestEmail: string;
  createdAt: string;
  updatedAt: string;
  lastReadAtGuest: string | null;
  lastReadAtHotel: string | null;
  messages: ChatMessage[];
};

type ChatStore = {
  threads: Map<string, StoredThread>;
};

const globalForChat = globalThis as typeof globalThis & {
  __hotelChatStoreV2?: ChatStore;
};

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCode(confirmationCode: string): string {
  return confirmationCode.trim().toUpperCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function countUnread(thread: StoredThread, reader: ChatSender): number {
  const opposite: ChatSender = reader === "guest" ? "hotel" : "guest";
  const lastReadAt = reader === "guest" ? thread.lastReadAtGuest : thread.lastReadAtHotel;
  return thread.messages.filter((message) => {
    if (message.sender !== opposite) return false;
    if (!lastReadAt) return true;
    return message.createdAt > lastReadAt;
  }).length;
}

function toThread(thread: StoredThread): ChatThread {
  return {
    confirmationCode: thread.confirmationCode,
    guestEmail: thread.guestEmail,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    lastReadAtGuest: thread.lastReadAtGuest,
    lastReadAtHotel: thread.lastReadAtHotel,
    unreadForGuest: countUnread(thread, "guest"),
    unreadForHotel: countUnread(thread, "hotel"),
    messages: [...thread.messages],
  };
}

function toSummary(thread: StoredThread): ChatThreadSummary {
  const lastMessage = thread.messages[thread.messages.length - 1] ?? null;
  return {
    confirmationCode: thread.confirmationCode,
    guestEmail: thread.guestEmail,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    messageCount: thread.messages.length,
    unreadForGuest: countUnread(thread, "guest"),
    unreadForHotel: countUnread(thread, "hotel"),
    lastMessage,
  };
}

function seedStore(store: ChatStore) {
  if (store.threads.size > 0) return;

  const now = new Date();
  const earlier = new Date(now.getTime() - 1000 * 60 * 12).toISOString();
  const later = new Date(now.getTime() - 1000 * 60 * 5).toISOString();
  const confirmationCode = "WH-DEMO00001";

  store.threads.set(confirmationCode, {
    confirmationCode,
    guestEmail: "guest@example.com",
    createdAt: earlier,
    updatedAt: later,
    // お客様はホテル返信を既読、ホテル側は未読のままにしてデモしやすくする
    lastReadAtGuest: later,
    lastReadAtHotel: null,
    messages: [
      {
        id: "msg_demo_1",
        confirmationCode,
        sender: "guest",
        body: "チェックイン時間を少し早められますか？",
        createdAt: earlier,
      },
      {
        id: "msg_demo_2",
        confirmationCode,
        sender: "hotel",
        body: "はい、15時以降であれば早めのチェックインが可能です。ご到着予定時刻を教えてください。",
        createdAt: later,
      },
    ],
  });
}

function getStore(): ChatStore {
  if (!globalForChat.__hotelChatStoreV2) {
    globalForChat.__hotelChatStoreV2 = { threads: new Map() };
    seedStore(globalForChat.__hotelChatStoreV2);
  }
  return globalForChat.__hotelChatStoreV2;
}

export class MemoryChatDao implements ChatDao {
  async listThreads(): Promise<ChatThreadSummary[]> {
    const store = getStore();
    return [...store.threads.values()]
      .map(toSummary)
      .sort((a, b) => {
        if (b.unreadForHotel !== a.unreadForHotel) {
          return b.unreadForHotel - a.unreadForHotel;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }

  async getThread(confirmationCode: string): Promise<ChatThread | null> {
    const store = getStore();
    const thread = store.threads.get(normalizeCode(confirmationCode));
    if (!thread) return null;
    return toThread(thread);
  }

  async ensureThread(confirmationCode: string, guestEmail: string): Promise<ChatThread> {
    const store = getStore();
    const code = normalizeCode(confirmationCode);
    const email = normalizeEmail(guestEmail);
    const existing = store.threads.get(code);

    if (existing) {
      if (existing.guestEmail !== email) {
        throw new Error("EMAIL_MISMATCH");
      }
      return toThread(existing);
    }

    const createdAt = new Date().toISOString();
    const thread: StoredThread = {
      confirmationCode: code,
      guestEmail: email,
      createdAt,
      updatedAt: createdAt,
      lastReadAtGuest: createdAt,
      lastReadAtHotel: null,
      messages: [],
    };
    store.threads.set(code, thread);
    return toThread(thread);
  }

  async addMessage(
    confirmationCode: string,
    sender: ChatSender,
    body: string,
  ): Promise<ChatMessage> {
    const store = getStore();
    const code = normalizeCode(confirmationCode);
    const thread = store.threads.get(code);
    if (!thread) {
      throw new Error("THREAD_NOT_FOUND");
    }

    const message: ChatMessage = {
      id: createId("msg"),
      confirmationCode: code,
      sender,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    thread.messages.push(message);
    thread.updatedAt = message.createdAt;
    if (sender === "guest") {
      thread.lastReadAtGuest = message.createdAt;
    } else {
      thread.lastReadAtHotel = message.createdAt;
    }
    return { ...message };
  }

  async markRead(confirmationCode: string, reader: ChatSender): Promise<ChatThread> {
    const store = getStore();
    const code = normalizeCode(confirmationCode);
    const thread = store.threads.get(code);
    if (!thread) {
      throw new Error("THREAD_NOT_FOUND");
    }

    const readAt = new Date().toISOString();
    if (reader === "guest") {
      thread.lastReadAtGuest = readAt;
    } else {
      thread.lastReadAtHotel = readAt;
    }
    return toThread(thread);
  }
}
