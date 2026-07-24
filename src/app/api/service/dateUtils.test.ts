import { describe, expect, test } from "bun:test";
import { calculateNights, isValidStayRange } from "@/app/api/service/dateUtils";

describe("dateUtils", () => {
  test("宿泊数を計算する", () => {
    expect(calculateNights("2026-08-01", "2026-08-04")).toBe(3);
  });

  test("同日または逆転した日付は0泊に丸める", () => {
    expect(calculateNights("2026-08-01", "2026-08-01")).toBe(0);
    expect(calculateNights("2026-08-04", "2026-08-01")).toBe(0);
  });

  test("チェックアウトがチェックインより後の場合だけ有効な宿泊期間にする", () => {
    expect(isValidStayRange("2026-08-01", "2026-08-02")).toBe(true);
    expect(isValidStayRange("2026-08-01", "2026-08-01")).toBe(false);
  });
});
