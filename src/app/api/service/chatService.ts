import type { ChatDao } from "@/app/api/dao/chatDao";
import { badRequest, notFound } from "@/app/api/service/apiError";
import type { ChatMessage, ChatSender, ChatThread, ChatThreadSummary } from "@/types/chat";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ChatService {
  constructor(private readonly chatDao: ChatDao) {}

  private validateGuestCredentials(confirmationCode: string, email: string) {
    if (!confirmationCode?.trim()) {
      throw badRequest("予約番号を入力してください。");
    }
    if (!email?.trim() || !EMAIL_PATTERN.test(email.trim())) {
      throw badRequest("メールアドレスを正しく入力してください。");
    }
  }

  private validateBody(body: string) {
    const trimmed = body?.trim() ?? "";
    if (!trimmed) throw badRequest("メッセージを入力してください。");
    if (trimmed.length > 1000) {
      throw badRequest("メッセージは1000文字以内で入力してください。");
    }
    return trimmed;
  }

  private async openThread(confirmationCode: string, reader: ChatSender): Promise<ChatThread> {
    try {
      return await this.chatDao.markRead(confirmationCode, reader);
    } catch (error) {
      if (error instanceof Error && error.message === "THREAD_NOT_FOUND") {
        throw notFound("チャットが見つかりません。");
      }
      throw error;
    }
  }

  async listThreadsForHotel(): Promise<ChatThreadSummary[]> {
    return this.chatDao.listThreads();
  }

  async getThreadForGuest(confirmationCode: string, email: string): Promise<ChatThread> {
    this.validateGuestCredentials(confirmationCode, email);
    try {
      await this.chatDao.ensureThread(confirmationCode, email);
      return await this.openThread(confirmationCode, "guest");
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_MISMATCH") {
        throw badRequest("予約番号またはメールアドレスが正しくありません。");
      }
      throw error;
    }
  }

  async getThreadForHotel(confirmationCode: string): Promise<ChatThread> {
    if (!confirmationCode?.trim()) {
      throw badRequest("予約番号を入力してください。");
    }
    const thread = await this.chatDao.getThread(confirmationCode);
    if (!thread) throw notFound("チャットが見つかりません。");
    return this.openThread(confirmationCode, "hotel");
  }

  async sendGuestMessage(
    confirmationCode: string,
    email: string,
    body: string,
  ): Promise<ChatMessage> {
    this.validateGuestCredentials(confirmationCode, email);
    const trimmed = this.validateBody(body);
    try {
      await this.chatDao.ensureThread(confirmationCode, email);
      return await this.chatDao.addMessage(confirmationCode, "guest", trimmed);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_MISMATCH") {
        throw badRequest("予約番号またはメールアドレスが正しくありません。");
      }
      throw error;
    }
  }

  async sendHotelMessage(confirmationCode: string, body: string): Promise<ChatMessage> {
    if (!confirmationCode?.trim()) {
      throw badRequest("予約番号を入力してください。");
    }
    const trimmed = this.validateBody(body);
    const thread = await this.chatDao.getThread(confirmationCode);
    if (!thread) throw notFound("チャットが見つかりません。");
    return this.chatDao.addMessage(confirmationCode, "hotel", trimmed);
  }
}
