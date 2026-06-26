import type { RoomDao } from "@/app/api/dao/roomDao";
import { mockRooms } from "@/app/api/dao/mock/mockRooms";
import type { AvailabilitySearchParams } from "@/app/api/model/reservation";
import type { AvailableRoom } from "@/app/api/model/room";
import { calculateNights } from "@/app/api/service/dateUtils";

const reservedRoomCounts: Record<string, number> = {
  "room-single-garden": 2,
  "room-twin-riverside": 1,
  "room-double-urban": 6,
  "room-suite-urban": 0,
};

export class MockRoomDao implements RoomDao {
  async findAvailableRooms(params: AvailabilitySearchParams): Promise<AvailableRoom[]> {
    const nights = calculateNights(params.checkInDate, params.checkOutDate);

    return mockRooms
      .filter((room) => room.capacity >= params.guests)
      .map((room) => {
        const reservedCount = reservedRoomCounts[room.id] ?? 0;
        const availableCount = Math.max(room.totalRooms - reservedCount, 0);

        return {
          ...room,
          availableCount,
          nights,
          totalPrice: room.pricePerNight * nights,
        };
      })
      .filter((room) => room.availableCount > 0);
  }

  async existsAvailableRoom(
    params: AvailabilitySearchParams & { roomId: string },
  ): Promise<boolean> {
    const rooms = await this.findAvailableRooms(params);
    return rooms.some((room) => room.id === params.roomId);
  }
}
