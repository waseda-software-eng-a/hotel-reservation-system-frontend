import { describe, expect, test } from "bun:test";
import {
  createAvailabilityQuery,
  formatStayDate,
  readAvailabilityParams,
} from "@/utils/reservationQuery";

describe("reservationQuery", () => {
  test("検索パラメータを読み取る", () => {
    const params = new URLSearchParams({
      checkInDate: "2026-08-01",
      checkOutDate: "2026-08-03",
      adults: "3",
      children: "1",
      roomCount: "2",
    });

    expect(readAvailabilityParams(params)).toEqual({
      checkInDate: "2026-08-01",
      checkOutDate: "2026-08-03",
      adults: 3,
      children: 1,
      roomCount: 2,
    });
  });

  test("未指定の人数と客室数にデフォルト値を入れる", () => {
    expect(readAvailabilityParams(new URLSearchParams())).toMatchObject({
      adults: 2,
      children: 0,
      roomCount: 1,
    });
  });

  test("検索クエリを生成する", () => {
    const query = createAvailabilityQuery({
      checkInDate: "2026-08-01",
      checkOutDate: "2026-08-03",
      adults: 2,
      children: 0,
      roomCount: 1,
    });

    expect(query.toString()).toBe(
      "checkInDate=2026-08-01&checkOutDate=2026-08-03&adults=2&children=0&roomCount=1",
    );
  });

  test("宿泊日を曜日付きで表示する", () => {
    expect(formatStayDate("2026-08-01")).toBe("8/1(土)");
    expect(formatStayDate("")).toBe("未選択");
  });
});
