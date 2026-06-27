import type { AvailabilityDao } from "@/app/api/dao/availabilityDao";
import { mockPlans } from "@/app/api/dao/mock/mockPlans";
import { mockRooms } from "@/app/api/dao/mock/mockRooms";
import type { AvailabilitySearchParams } from "@/app/api/model/reservation";
import type { AvailablePlan, AvailableRoom, Plan } from "@/app/api/model/room";
import { calculateNights } from "@/app/api/service/dateUtils";

const reservedRoomCounts: Record<string, number> = {
  "room-single-garden": 2,
  "room-twin-riverside": 1,
  "room-double-urban": 6,
  "room-suite-urban": 0,
  "room-garden-double": 2,
  "room-garden-suite": 1,
  "room-bay-twin": 3,
  "room-bay-family": 1,
};

export class MockAvailabilityDao implements AvailabilityDao {
  private findAvailableRoomsForPlan(params: AvailabilitySearchParams, plan: Plan): AvailableRoom[] {
    const nights = calculateNights(params.checkInDate, params.checkOutDate);
    const guestCount = params.adults + params.children;

    return mockRooms
      .filter((room) => room.hotelId === params.hotelId)
      .filter((room) => plan.roomIds.includes(room.id))
      .filter((room) => room.capacity * params.roomCount >= guestCount)
      .map((room) => {
        const reservedCount = reservedRoomCounts[room.id] ?? 0;
        const availableCount = Math.max(room.totalRooms - reservedCount, 0);

        return {
          ...room,
          availableCount,
          nights,
          totalPrice:
            (room.pricePerNight * params.roomCount + plan.priceAdjustmentPerAdult * params.adults) *
            nights,
        };
      })
      .filter((room) => room.availableCount >= params.roomCount);
  }

  async findAvailablePlans(params: AvailabilitySearchParams): Promise<AvailablePlan[]> {
    return mockPlans
      .filter((plan) => plan.hotelId === params.hotelId)
      .map((plan) => {
        const rooms = this.findAvailableRoomsForPlan(params, plan);
        return {
          ...plan,
          rooms,
          lowestTotalPrice: Math.min(...rooms.map((room) => room.totalPrice)),
        };
      })
      .filter((plan) => plan.rooms.length > 0);
  }
}
