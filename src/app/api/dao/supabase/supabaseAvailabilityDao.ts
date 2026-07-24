import type { AvailabilityDao } from "@/app/api/dao/availabilityDao";
import type { AvailabilitySearchParams } from "@/app/api/model/reservation";
import type { AvailablePlan, AvailableRoom, MealType, RoomType } from "@/app/api/model/room";
import { internalError } from "@/app/api/service/apiError";
import { calculateNights } from "@/app/api/service/dateUtils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TableRow } from "@/types/database";

const DEFAULT_IMAGE_PATH = "/images/waseriko-hotel.png";
const ROOM_IMAGE_PATHS: Record<RoomType, string> = {
  single: "/images/single-room-image.png",
  double: "/images/double-room-image.png",
  twin: "/images/twin-room-image.png",
  suite: "/images/sweet-room-image.png",
};
const PLAN_IMAGE_PATHS: Record<MealType, string> = {
  "room-only": DEFAULT_IMAGE_PATH,
  breakfast: "/images/breakfast-plan-image.png",
  "half-board": "/images/dinner-plan-image.png",
};

function toMealType(value: TableRow<"plans">["meal_type"]): MealType {
  if (value === "room_only") return "room-only";
  if (value === "half_board") return "half-board";
  return value;
}

function getStayDates(checkInDate: string, checkOutDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${checkInDate}T00:00:00Z`);
  const end = new Date(`${checkOutDate}T00:00:00Z`);

  while (current < end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

function getAvailableCount(
  roomType: TableRow<"room_types">,
  reservations: TableRow<"reservations">[],
  stayDates: string[],
): number {
  const reservedCounts = stayDates.map((stayDate) =>
    reservations
      .filter(
        (reservation) =>
          reservation.room_type_id === roomType.id &&
          reservation.check_in_date <= stayDate &&
          reservation.check_out_date > stayDate,
      )
      .reduce((count, reservation) => count + reservation.room_count, 0),
  );

  return Math.max(roomType.total_rooms - Math.max(...reservedCounts, 0), 0);
}

export class SupabaseAvailabilityDao implements AvailabilityDao {
  async findAvailablePlans(params: AvailabilitySearchParams): Promise<AvailablePlan[]> {
    const supabase = getSupabaseServerClient();
    const [
      plansResult,
      roomTypesResult,
      planRoomTypesResult,
      amenitiesResult,
      roomTypeAmenitiesResult,
      reservationsResult,
    ] = await Promise.all([
      supabase.from("plans").select("*").order("display_order"),
      supabase.from("room_types").select("*"),
      supabase.from("plan_room_types").select("*"),
      supabase.from("amenities").select("*").order("display_order"),
      supabase.from("room_type_amenities").select("*"),
      supabase
        .from("reservations")
        .select("*")
        .in("status", ["pending", "confirmed"])
        .lt("check_in_date", params.checkOutDate)
        .gt("check_out_date", params.checkInDate),
    ]);

    const firstError = [
      plansResult.error,
      roomTypesResult.error,
      planRoomTypesResult.error,
      amenitiesResult.error,
      roomTypeAmenitiesResult.error,
      reservationsResult.error,
    ].find(Boolean);

    if (firstError) {
      throw internalError(`空室情報の取得に失敗しました: ${firstError.message}`);
    }

    const plans = plansResult.data ?? [];
    const roomTypes = roomTypesResult.data ?? [];
    const planRoomTypes = planRoomTypesResult.data ?? [];
    const amenities = amenitiesResult.data ?? [];
    const roomTypeAmenities = roomTypeAmenitiesResult.data ?? [];
    const reservations = reservationsResult.data ?? [];
    const stayDates = getStayDates(params.checkInDate, params.checkOutDate);
    const nights = calculateNights(params.checkInDate, params.checkOutDate);
    const guestCount = params.adults + params.children;

    return plans.flatMap((plan) => {
      const mealType = toMealType(plan.meal_type);
      const roomTypeIds = new Set(
        planRoomTypes
          .filter((relation) => relation.plan_id === plan.id)
          .map((relation) => relation.room_type_id),
      );

      const rooms: AvailableRoom[] = roomTypes
        .filter((roomType) => roomTypeIds.has(roomType.id))
        .filter((roomType) => roomType.max_occupancy * params.roomCount >= guestCount)
        .map((roomType) => {
          const amenityIds = new Set(
            roomTypeAmenities
              .filter((relation) => relation.room_type_id === roomType.id)
              .map((relation) => relation.amenity_id),
          );
          const availableCount = getAvailableCount(roomType, reservations, stayDates);

          return {
            id: roomType.id,
            name: roomType.name,
            type: roomType.room_kind,
            capacity: roomType.max_occupancy,
            amenities: amenities
              .filter((amenity) => amenityIds.has(amenity.id))
              .map((amenity) => amenity.name),
            imageUrl: ROOM_IMAGE_PATHS[roomType.room_kind],
            description: roomType.description,
            wing: roomType.wing ?? "",
            floor: roomType.floor_label ?? "",
            sizeSqm: roomType.size_sqm ?? 0,
            bedType: roomType.bed_kind,
            availableCount,
            nights,
            totalPrice:
              (roomType.base_price_yen * params.roomCount +
                plan.adult_surcharge_yen * params.adults) *
              nights,
          };
        })
        .filter((room) => room.availableCount >= params.roomCount);

      if (rooms.length === 0) return [];

      return [
        {
          id: plan.id,
          name: plan.name,
          summary: plan.summary,
          mealType,
          paymentMethods: plan.payment_methods,
          checkInTime: plan.check_in_time.slice(0, 5),
          checkOutTime: plan.check_out_time.slice(0, 5),
          tags: plan.tags,
          cancellationPolicy: plan.cancellation_policy,
          imageUrl: PLAN_IMAGE_PATHS[mealType],
          rooms,
          lowestTotalPrice: Math.min(...rooms.map((room) => room.totalPrice)),
        },
      ];
    });
  }
}
