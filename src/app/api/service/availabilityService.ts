import type { RoomDao } from "@/app/api/dao/roomDao";
import type { AvailabilitySearchParams } from "@/app/api/model/reservation";
import type { AvailableRoom } from "@/app/api/model/room";
import { isValidStayRange } from "@/app/api/service/dateUtils";

export class AvailabilityService {
  constructor(private readonly roomDao: RoomDao) {}

  async search(params: AvailabilitySearchParams): Promise<AvailableRoom[]> {
    if (!params.checkInDate || !params.checkOutDate) {
      throw new Error("宿泊日を入力してください。");
    }

    if (!isValidStayRange(params.checkInDate, params.checkOutDate)) {
      throw new Error("チェックアウト日はチェックイン日より後にしてください。");
    }

    if (!Number.isInteger(params.guests) || params.guests < 1) {
      throw new Error("人数は1名以上で入力してください。");
    }

    return this.roomDao.findAvailableRooms(params);
  }
}
