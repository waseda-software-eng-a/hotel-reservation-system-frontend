import type { AvailableRoom } from "@/app/api/model/room";
import type { AvailabilitySearchParams } from "@/app/api/model/reservation";

export interface RoomDao {
  findAvailableRooms(params: AvailabilitySearchParams): Promise<AvailableRoom[]>;
  existsAvailableRoom(params: AvailabilitySearchParams & { roomId: string }): Promise<boolean>;
}
