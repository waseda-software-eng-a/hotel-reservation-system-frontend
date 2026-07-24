import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Button from "@/components/atoms/Button";

describe("Button", () => {
  test("デフォルトではbutton typeとprimaryスタイルで描画する", () => {
    const html = renderToStaticMarkup(createElement(Button, null, "予約する"));

    expect(html).toContain('type="button"');
    expect(html).toContain("bg-deepGreen");
    expect(html).toContain("予約する");
  });

  test("variantとtypeとdisabledを反映する", () => {
    const html = renderToStaticMarkup(
      createElement(
        Button,
        {
          disabled: true,
          type: "submit",
          variant: "secondary",
        },
        "送信",
      ),
    );

    expect(html).toContain('type="submit"');
    expect(html).toContain("disabled");
    expect(html).toContain("bg-white");
    expect(html).toContain("送信");
  });
});
