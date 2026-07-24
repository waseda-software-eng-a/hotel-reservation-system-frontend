import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SelectField from "@/components/atoms/SelectField";

describe("SelectField", () => {
  test("ラベルと選択肢を描画する", () => {
    const html = renderToStaticMarkup(
      createElement(SelectField, {
        label: "食事条件",
        name: "mealType",
        options: [
          { label: "素泊まり", value: "room-only" },
          { label: "朝食付き", value: "breakfast" },
        ],
        value: "breakfast",
        readOnly: true,
      }),
    );

    expect(html).toContain("食事条件");
    expect(html).toContain('name="mealType"');
    expect(html).toContain('value="room-only"');
    expect(html).toContain("素泊まり");
    expect(html).toContain('value="breakfast"');
    expect(html).toContain("朝食付き");
  });
});
