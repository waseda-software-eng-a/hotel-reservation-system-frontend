import { MockReservationDao } from "@/app/api/dao/mock/mockReservationDao";
import { MockRoomDao } from "@/app/api/dao/mock/mockRoomDao";

export const roomDao = new MockRoomDao();
export const reservationDao = new MockReservationDao();
