import type { AvailabilitySearchParams } from "@/app/api/model/reservation";
import type { AvailablePlan } from "@/app/api/model/room";

export interface AvailabilityDao {
  findAvailablePlans(params: AvailabilitySearchParams): Promise<AvailablePlan[]>;
}
