import { describe, expect, test } from "bun:test";
import type { AvailabilityDao } from "@/app/api/dao/availabilityDao";
import type { ReservationDao } from "@/app/api/dao/reservationDao";
import { ApiError } from "@/app/api/service/apiError";
import { ReservationService } from "@/app/api/service/reservationService";
import type {
  AvailabilitySearchParams,
  AvailablePlan,
  Reservation,
  ReservationDetails,
  ReservationDraft,
  ReservationUpdateDraft,
} from "@/types/reservation";

class FakeAvailabilityDao implements AvailabilityDao {
  calls: AvailabilitySearchParams[] = [];

  constructor(private readonly plans: AvailablePlan[] = []) {}

  async findAvailablePlans(params: AvailabilitySearchParams): Promise<AvailablePlan[]> {
    this.calls.push(params);
    return this.plans;
  }
}

class FakeReservationDao implements ReservationDao {
  createdDrafts: ReservationDraft[] = [];

  constructor(private readonly reservation: ReservationDetails | null = reservationDetails()) {}

  async create(draft: ReservationDraft): Promise<Reservation> {
    this.createdDrafts.push(draft);
    return { ...reservationDetails(), ...draft };
  }

  async findByCredentials(): Promise<ReservationDetails | null> {
    return this.reservation;
  }

  async update(draft: ReservationUpdateDraft): Promise<ReservationDetails> {
    return { ...reservationDetails(), ...draft };
  }

  async cancel(): Promise<ReservationDetails> {
    return { ...reservationDetails(), status: "cancelled", cancelledAt: "2026-07-24T00:00:00Z" };
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

function reservationDraft(): ReservationDraft {
  return {
    planId: "plan-1",
    roomId: "room-1",
    checkInDate: "2026-08-01",
    checkOutDate: "2026-08-03",
    adults: 1,
    children: 0,
    roomCount: 1,
    paymentMethod: "onsite",
    termsAccepted: true,
    representativeInfo: {
      email: "guest@example.com",
      phone: "09012345678",
      postalCode: "169-0051",
      address: "東京都新宿区西早稲田1-2-3",
    },
    guestNames: ["山田 太郎"],
  };
}

function reservationDetails(): ReservationDetails {
  return {
    ...reservationDraft(),
    id: "WH-1234567890",
    status: "confirmed",
    createdAt: "2026-07-24T00:00:00Z",
    totalPrice: 25600,
    planName: "シンプルステイ",
    roomName: "スタンダードシングル",
    cancellationPolicy: "前日20%",
    cancelledAt: null,
  };
}

describe("ReservationService", () => {
  test("有効な予約作成では空室を検証してDAOへ保存を委譲する", async () => {
    const availabilityDao = new FakeAvailabilityDao([availablePlan()]);
    const reservationDao = new FakeReservationDao();
    const service = new ReservationService(reservationDao, availabilityDao);
    const draft = reservationDraft();

    const reservation = await service.create(draft);

    expect(reservation.id).toBe("WH-1234567890");
    expect(availabilityDao.calls).toHaveLength(1);
    expect(reservationDao.createdDrafts).toEqual([draft]);
  });

  test("同意なしの予約作成は400エラーにする", async () => {
    const service = new ReservationService(
      new FakeReservationDao(),
      new FakeAvailabilityDao([availablePlan()]),
    );

    try {
      await service.create({ ...reservationDraft(), termsAccepted: false });
      throw new Error("Expected service.create to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    }
  });

  test("選択プランまたは客室が空室検索結果にない場合は409エラーにする", async () => {
    const service = new ReservationService(new FakeReservationDao(), new FakeAvailabilityDao([]));

    try {
      await service.create(reservationDraft());
      throw new Error("Expected service.create to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(409);
    }
  });

  test("予約が見つからない場合は404エラーにする", async () => {
    const service = new ReservationService(new FakeReservationDao(null), new FakeAvailabilityDao());

    try {
      await service.find({ confirmationCode: "WH-NOTFOUND", email: "guest@example.com" });
      throw new Error("Expected service.find to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
    }
  });

  test("予約変更ではサービス層の空室再検索を省略し、DAO側のロック付き検証に任せる", async () => {
    const availabilityDao = new FakeAvailabilityDao([availablePlan()]);
    const reservationDao = new FakeReservationDao();
    const service = new ReservationService(reservationDao, availabilityDao);

    const updated = await service.update({
      ...reservationDraft(),
      confirmationCode: "WH-1234567890",
      email: "guest@example.com",
    });

    expect(updated.id).toBe("WH-1234567890");
    expect(availabilityDao.calls).toHaveLength(0);
  });
});
