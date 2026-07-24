import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TextField from "@/components/atoms/TextField";

describe("TextField", () => {
  test("ラベルと入力属性を描画する", () => {
    const html = renderToStaticMarkup(
      createElement(TextField, {
        label: "メールアドレス",
        name: "email",
        placeholder: "guest@example.com",
        required: true,
        type: "email",
        value: "guest@example.com",
        readOnly: true,
      }),
    );

    expect(html).toContain("メールアドレス");
    expect(html).toContain('name="email"');
    expect(html).toContain('placeholder="guest@example.com"');
    expect(html).toContain("required");
    expect(html).toContain('type="email"');
    expect(html).toContain('value="guest@example.com"');
  });
});
