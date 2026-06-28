import type { AvailabilityDao } from "@/app/api/dao/availabilityDao";
import type { ReservationDao } from "@/app/api/dao/reservationDao";
import type { Reservation, ReservationDraft } from "@/app/api/model/reservation";
import { isValidStayRange } from "@/app/api/service/dateUtils";

export class ReservationService {
  constructor(
    private readonly reservationDao: ReservationDao,
    private readonly availabilityDao: AvailabilityDao,
  ) {}

  async create(draft: ReservationDraft): Promise<Reservation> {
    if (!draft.roomId) {
      throw new Error("部屋を選択してください。");
    }

    if (!draft.planId) {
      throw new Error("宿泊プランを選択してください。");
    }

    if (!isValidStayRange(draft.checkInDate, draft.checkOutDate)) {
      throw new Error("宿泊日を確認してください。");
    }

    if (
      !draft.representativeInfo?.email ||
      !draft.representativeInfo.phone ||
      !draft.representativeInfo.postalCode ||
      !draft.representativeInfo.address
    ) {
      throw new Error("代表者情報を入力してください。");
    }

    if (!draft.termsAccepted) {
      throw new Error("キャンセルポリシーと利用条件への同意が必要です。");
    }

    if (
      !Number.isInteger(draft.adults) ||
      draft.adults < 1 ||
      !Number.isInteger(draft.children) ||
      draft.children < 0 ||
      !Number.isInteger(draft.roomCount) ||
      draft.roomCount < 1
    ) {
      throw new Error("宿泊人数・客室数を確認してください。");
    }

    if (
      !Array.isArray(draft.guestNames) ||
      draft.guestNames.length !== draft.adults + draft.children ||
      draft.guestNames.some((name) => !name.trim())
    ) {
      throw new Error("宿泊者全員の氏名を入力してください。");
    }

    if (!/^\d{3}-?\d{4}$/.test(draft.representativeInfo.postalCode)) {
      throw new Error("郵便番号は7桁で入力してください。");
    }

    const plans = await this.availabilityDao.findAvailablePlans({
      checkInDate: draft.checkInDate,
      checkOutDate: draft.checkOutDate,
      adults: draft.adults,
      children: draft.children,
      roomCount: draft.roomCount,
    });
    const selectedPlan = plans.find((plan) => plan.id === draft.planId);
    const selectedRoom = selectedPlan?.rooms.find((room) => room.id === draft.roomId);

    if (!selectedPlan || !selectedRoom) {
      throw new Error("選択したプラン・客室は現在予約できません。");
    }

    if (!selectedPlan.paymentMethods.includes(draft.paymentMethod)) {
      throw new Error("選択した支払方法は利用できません。");
    }

    return this.reservationDao.create(draft);
  }
}
