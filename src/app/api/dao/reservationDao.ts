import type {
  Reservation,
  ReservationCredentials,
  ReservationDetails,
  ReservationDraft,
  ReservationUpdateDraft,
} from "@/app/api/model/reservation";

export interface ReservationDao {
  create(draft: ReservationDraft): Promise<Reservation>;
  findByCredentials(credentials: ReservationCredentials): Promise<ReservationDetails | null>;
  update(draft: ReservationUpdateDraft): Promise<ReservationDetails>;
  cancel(credentials: ReservationCredentials): Promise<ReservationDetails>;
}
