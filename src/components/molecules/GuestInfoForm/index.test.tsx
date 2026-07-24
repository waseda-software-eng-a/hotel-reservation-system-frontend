import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import GuestInfoForm from "@/components/molecules/GuestInfoForm";

describe("GuestInfoForm", () => {
  test("宿泊者と代表者連絡先の入力欄を描画する", () => {
    const html = renderToStaticMarkup(
      createElement(GuestInfoForm, {
        disabled: false,
        guestNames: ["山田 太郎", ""],
        isSubmitting: false,
        representativeInfo: {
          email: "guest@example.com",
          phone: "09012345678",
          postalCode: "169-0051",
          address: "東京都新宿区西早稲田1-2-3",
        },
        onGuestNamesChange: () => undefined,
        onRepresentativeInfoChange: () => undefined,
        onSubmit: () => undefined,
        beforeSubmit: createElement("p", null, "同意確認"),
      }),
    );

    expect(html).toContain("宿泊者1");
    expect(html).toContain("宿泊者2");
    expect(html).toContain("代表者連絡先");
    expect(html).toContain("メールアドレス");
    expect(html).toContain("郵便番号");
    expect(html).toContain("同意確認");
    expect(html).toContain("予約を確定");
  });

  test("送信中はボタン文言とdisabled状態を反映する", () => {
    const html = renderToStaticMarkup(
      createElement(GuestInfoForm, {
        disabled: true,
        guestNames: ["山田 太郎"],
        isSubmitting: true,
        representativeInfo: {
          email: "",
          phone: "",
          postalCode: "",
          address: "",
        },
        onGuestNamesChange: () => undefined,
        onRepresentativeInfoChange: () => undefined,
        onSubmit: () => undefined,
      }),
    );

    expect(html).toContain("disabled");
    expect(html).toContain("予約中");
  });
});
