import type { AvailabilityDao } from "@/app/api/dao/availabilityDao";
import type { ReservationDao } from "@/app/api/dao/reservationDao";
import type {
  Reservation,
  ReservationCredentials,
  ReservationDetails,
  ReservationDraft,
  ReservationUpdateDraft,
} from "@/app/api/model/reservation";
import { badRequest, conflict, notFound } from "@/app/api/service/apiError";
import { isValidStayRange } from "@/app/api/service/dateUtils";

export class ReservationService {
  constructor(
    private readonly reservationDao: ReservationDao,
    private readonly availabilityDao: AvailabilityDao,
  ) {}

  private validateCredentials(credentials: ReservationCredentials) {
    if (!credentials.confirmationCode?.trim() || !credentials.email?.trim()) {
      throw badRequest("予約番号とメールアドレスを入力してください。");
    }
  }

  private async validateDraft(draft: ReservationDraft, checkAvailability = true) {
    if (!draft.roomId) throw badRequest("部屋を選択してください。");
    if (!draft.planId) throw badRequest("宿泊プランを選択してください。");
    if (!isValidStayRange(draft.checkInDate, draft.checkOutDate)) {
      throw badRequest("宿泊日を確認してください。");
    }
    if (
      !draft.representativeInfo?.email ||
      !draft.representativeInfo.phone ||
      !draft.representativeInfo.postalCode ||
      !draft.representativeInfo.address
    ) {
      throw badRequest("代表者情報を入力してください。");
    }
    if (!draft.termsAccepted) {
      throw badRequest("キャンセルポリシーと利用条件への同意が必要です。");
    }
    if (
      !Number.isInteger(draft.adults) ||
      draft.adults < 1 ||
      !Number.isInteger(draft.children) ||
      draft.children < 0 ||
      !Number.isInteger(draft.roomCount) ||
      draft.roomCount < 1
    ) {
      throw badRequest("宿泊人数・客室数を確認してください。");
    }
    if (
      !Array.isArray(draft.guestNames) ||
      draft.guestNames.length !== draft.adults + draft.children ||
      draft.guestNames.some((name) => !name.trim())
    ) {
      throw badRequest("宿泊者全員の氏名を入力してください。");
    }
    if (!/^\d{3}-?\d{4}$/.test(draft.representativeInfo.postalCode)) {
      throw badRequest("郵便番号は7桁で入力してください。");
    }

    if (!checkAvailability) return;

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
      throw conflict("選択したプラン・客室は現在予約できません。");
    }
    if (!selectedPlan.paymentMethods.includes(draft.paymentMethod)) {
      throw badRequest("選択した支払方法は利用できません。");
    }
  }

  async create(draft: ReservationDraft): Promise<Reservation> {
    await this.validateDraft(draft);
    return this.reservationDao.create(draft);
  }

  async find(credentials: ReservationCredentials): Promise<ReservationDetails> {
    this.validateCredentials(credentials);
    const reservation = await this.reservationDao.findByCredentials(credentials);
    if (!reservation) throw notFound("予約番号またはメールアドレスが正しくありません。");
    return reservation;
  }

  async update(draft: ReservationUpdateDraft): Promise<ReservationDetails> {
    this.validateCredentials(draft);
    await this.validateDraft(draft, false);
    return this.reservationDao.update(draft);
  }

  async cancel(credentials: ReservationCredentials): Promise<ReservationDetails> {
    this.validateCredentials(credentials);
    return this.reservationDao.cancel(credentials);
  }
}
