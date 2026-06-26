import type { ReservationDao } from "@/app/api/dao/reservationDao";
import type { RoomDao } from "@/app/api/dao/roomDao";
import type { Reservation, ReservationDraft } from "@/app/api/model/reservation";
import { isValidStayRange } from "@/app/api/service/dateUtils";

export class ReservationService {
  constructor(
    private readonly reservationDao: ReservationDao,
    private readonly roomDao: RoomDao,
  ) {}

  async create(draft: ReservationDraft): Promise<Reservation> {
    if (!draft.roomId) {
      throw new Error("部屋を選択してください。");
    }

    if (!isValidStayRange(draft.checkInDate, draft.checkOutDate)) {
      throw new Error("宿泊日を確認してください。");
    }

    if (!draft.guestInfo.fullName || !draft.guestInfo.email || !draft.guestInfo.phone) {
      throw new Error("利用者情報を入力してください。");
    }

    const exists = await this.roomDao.existsAvailableRoom({
      roomId: draft.roomId,
      checkInDate: draft.checkInDate,
      checkOutDate: draft.checkOutDate,
      guests: draft.guests,
    });

    if (!exists) {
      throw new Error("選択した部屋は現在予約できません。");
    }

    return this.reservationDao.create(draft);
  }
}
