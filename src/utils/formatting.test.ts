import { describe, expect, test } from "bun:test";
import { formatCurrency } from "@/utils/formatting";

describe("formatCurrency", () => {
  test("日本円を小数なしで表示する", () => {
    expect(formatCurrency(12800)).toBe("¥12,800");
  });
});
