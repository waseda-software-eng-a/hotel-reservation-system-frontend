import { describe, expect, test } from "bun:test";
import { MemoryChatDao } from "@/app/api/dao/memory/memoryChatDao";
import { ChatService } from "@/app/api/service/chatService";

describe("ChatService", () => {
  test("guest can create a thread and exchange messages with hotel", async () => {
    const service = new ChatService(new MemoryChatDao());
    const code = `WH-TEST${Date.now()}`;
    const email = "chat-guest@example.com";

    const thread = await service.getThreadForGuest(code, email);
    expect(thread.messages).toHaveLength(0);

    await service.sendGuestMessage(code, email, "荷物預かりは可能ですか？");
    const hotelThread = await service.getThreadForHotel(code);
    expect(hotelThread.messages).toHaveLength(1);
    expect(hotelThread.messages[0]?.sender).toBe("guest");
    expect(hotelThread.unreadForHotel).toBe(0);

    await service.sendHotelMessage(code, "はい、フロントでお預かりできます。");
    const updated = await service.getThreadForGuest(code, email);
    expect(updated.messages).toHaveLength(2);
    expect(updated.messages[1]?.sender).toBe("hotel");
    expect(updated.unreadForGuest).toBe(0);
  });

  test("tracks unread for hotel until the thread is opened", async () => {
    const service = new ChatService(new MemoryChatDao());
    const code = `WH-UNREAD${Date.now()}`;
    const email = "unread@example.com";

    await service.sendGuestMessage(code, email, "到着が遅れそうです");
    const listed = await service.listThreadsForHotel();
    const summary = listed.find((thread) => thread.confirmationCode === code);
    expect(summary?.unreadForHotel).toBe(1);

    await service.getThreadForHotel(code);
    const afterOpen = await service.listThreadsForHotel();
    expect(afterOpen.find((thread) => thread.confirmationCode === code)?.unreadForHotel).toBe(0);
  });

  test("rejects mismatched guest email", async () => {
    const service = new ChatService(new MemoryChatDao());
    const code = `WH-LOCK${Date.now()}`;
    await service.sendGuestMessage(code, "a@example.com", "こんにちは");

    expect(service.getThreadForGuest(code, "b@example.com")).rejects.toThrow(
      "予約番号またはメールアドレスが正しくありません。",
    );
  });
});
