import type { Reservation, ReservationDraft } from "@/app/api/model/reservation";

export interface ReservationDao {
  create(draft: ReservationDraft, totalPrice: number): Promise<Reservation>;
}
