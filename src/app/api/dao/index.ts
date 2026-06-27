import { MockAvailabilityDao } from "@/app/api/dao/mock/mockAvailabilityDao";
import { MockReservationDao } from "@/app/api/dao/mock/mockReservationDao";

export const availabilityDao = new MockAvailabilityDao();
export const reservationDao = new MockReservationDao();
