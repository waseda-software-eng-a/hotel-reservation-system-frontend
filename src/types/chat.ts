export type ChatSender = "guest" | "hotel";

export type ChatMessage = {
  id: string;
  confirmationCode: string;
  sender: ChatSender;
  body: string;
  createdAt: string;
};

export type ChatThread = {
  confirmationCode: string;
  guestEmail: string;
  createdAt: string;
  updatedAt: string;
  lastReadAtGuest: string | null;
  lastReadAtHotel: string | null;
  unreadForGuest: number;
  unreadForHotel: number;
  messages: ChatMessage[];
};

export type ChatThreadSummary = {
  confirmationCode: string;
  guestEmail: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  unreadForGuest: number;
  unreadForHotel: number;
  lastMessage: ChatMessage | null;
};
