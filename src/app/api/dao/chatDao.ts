import type { ChatMessage, ChatSender, ChatThread, ChatThreadSummary } from "@/types/chat";

export type ChatDao = {
  listThreads(): Promise<ChatThreadSummary[]>;
  getThread(confirmationCode: string): Promise<ChatThread | null>;
  ensureThread(confirmationCode: string, guestEmail: string): Promise<ChatThread>;
  addMessage(
    confirmationCode: string,
    sender: ChatSender,
    body: string,
  ): Promise<ChatMessage>;
  markRead(confirmationCode: string, reader: ChatSender): Promise<ChatThread>;
};
