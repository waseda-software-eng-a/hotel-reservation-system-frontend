import type { ReservationDao } from "@/app/api/dao/reservationDao";
import type { Reservation, ReservationDraft } from "@/app/api/model/reservation";

export class MockReservationDao implements ReservationDao {
  async create(draft: ReservationDraft, totalPrice: number): Promise<Reservation> {
    return {
      ...draft,
      id: `mock-reservation-${Date.now()}`,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      totalPrice,
    };
  }
}
