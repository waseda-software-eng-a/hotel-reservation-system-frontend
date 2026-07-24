import { describe, expect, test } from "bun:test";
import type { AvailabilityDao } from "@/app/api/dao/availabilityDao";
import { ApiError } from "@/app/api/service/apiError";
import { AvailabilityService } from "@/app/api/service/availabilityService";
import type { AvailabilitySearchParams, AvailablePlan } from "@/types/reservation";

class FakeAvailabilityDao implements AvailabilityDao {
  calls: AvailabilitySearchParams[] = [];

  constructor(private readonly plans: AvailablePlan[] = []) {}

  async findAvailablePlans(params: AvailabilitySearchParams): Promise<AvailablePlan[]> {
    this.calls.push(params);
    return this.plans;
  }
}

function availablePlan(): AvailablePlan {
  return {
    id: "plan-1",
    name: "シンプルステイ",
    summary: "素泊まりプラン",
    mealType: "room-only",
    paymentMethods: ["onsite", "web"],
    checkInTime: "14:00",
    checkOutTime: "12:00",
    tags: ["素泊まり"],
    cancellationPolicy: "前日20%",
    imageUrl: "/images/waseriko-hotel.png",
    lowestTotalPrice: 25600,
    rooms: [
      {
        id: "room-1",
        name: "スタンダードシングル",
        type: "single",
        capacity: 1,
        amenities: ["無料Wi-Fi"],
        imageUrl: "/images/single-room-image.png",
        description: "コンパクトな客室です。",
        wing: "本館",
        floor: "7階",
        sizeSqm: 22,
        bedType: "single",
        availableCount: 3,
        nights: 2,
        totalPrice: 25600,
      },
    ],
  };
}

describe("AvailabilityService", () => {
  test("有効な条件ではDAOへ検索を委譲する", async () => {
    const dao = new FakeAvailabilityDao([availablePlan()]);
    const service = new AvailabilityService(dao);
    const params = {
      checkInDate: "2026-08-01",
      checkOutDate: "2026-08-03",
      adults: 1,
      children: 0,
      roomCount: 1,
    };

    const plans = await service.search(params);

    expect(plans).toHaveLength(1);
    expect(dao.calls).toEqual([params]);
  });

  test("日付未入力は400エラーにする", async () => {
    const service = new AvailabilityService(new FakeAvailabilityDao());

    try {
      await service.search({
        checkInDate: "",
        checkOutDate: "",
        adults: 1,
        children: 0,
        roomCount: 1,
      });
      throw new Error("Expected service.search to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    }
  });

  test("不正な人数は400エラーにする", async () => {
    const service = new AvailabilityService(new FakeAvailabilityDao());

    try {
      await service.search({
        checkInDate: "2026-08-01",
        checkOutDate: "2026-08-03",
        adults: 0,
        children: 0,
        roomCount: 1,
      });
      throw new Error("Expected service.search to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    }
  });
});
