"use client";

import type { ReactNode } from "react";
import Button from "@/components/atoms/Button";
import TextField from "@/components/atoms/TextField";
import type { RepresentativeInfo } from "@/types/reservation";

type GuestInfoFormProps = {
  disabled: boolean;
  guestNames: string[];
  isSubmitting: boolean;
  representativeInfo: RepresentativeInfo;
  onGuestNamesChange: (guestNames: string[]) => void;
  onRepresentativeInfoChange: (representativeInfo: RepresentativeInfo) => void;
  onSubmit: () => void;
  beforeSubmit?: ReactNode;
};

export default function GuestInfoForm({
  disabled,
  guestNames,
  isSubmitting,
  representativeInfo,
  onGuestNamesChange,
  onRepresentativeInfoChange,
  onSubmit,
  beforeSubmit,
}: GuestInfoFormProps) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <fieldset className="grid gap-4">
        <legend className="mb-3 font-serif text-base font-semibold text-ink">宿泊者氏名</legend>
        {guestNames.map((name, index) => (
          <TextField
            disabled={disabled}
            key={index}
            label={`宿泊者${index + 1}${index === 0 ? "（代表者）" : ""}`}
            onChange={(event) => {
              const nextGuestNames = [...guestNames];
              nextGuestNames[index] = event.target.value;
              onGuestNamesChange(nextGuestNames);
            }}
            placeholder="山田 太郎"
            required
            value={name}
          />
        ))}
      </fieldset>

      <fieldset className="mt-2 grid gap-4 border-t border-stone-200 pt-5">
        <legend className="px-2 font-serif text-base font-semibold text-ink">代表者連絡先</legend>
        <TextField
          disabled={disabled}
          label="メールアドレス"
          onChange={(event) =>
            onRepresentativeInfoChange({ ...representativeInfo, email: event.target.value })
          }
          placeholder="guest@example.com"
          required
          type="email"
          value={representativeInfo.email}
        />
        <TextField
          disabled={disabled}
          label="電話番号"
          onChange={(event) =>
            onRepresentativeInfoChange({ ...representativeInfo, phone: event.target.value })
          }
          placeholder="09012345678"
          required
          type="tel"
          value={representativeInfo.phone}
        />
        <TextField
          autoComplete="postal-code"
          disabled={disabled}
          inputMode="numeric"
          label="郵便番号"
          onChange={(event) =>
            onRepresentativeInfoChange({ ...representativeInfo, postalCode: event.target.value })
          }
          pattern="[0-9]{3}-?[0-9]{4}"
          placeholder="169-0051"
          required
          value={representativeInfo.postalCode}
        />
        <TextField
          autoComplete="street-address"
          disabled={disabled}
          label="住所"
          onChange={(event) =>
            onRepresentativeInfoChange({ ...representativeInfo, address: event.target.value })
          }
          placeholder="東京都新宿区西早稲田1-2-3"
          required
          value={representativeInfo.address}
        />
      </fieldset>
      {beforeSubmit}
      <Button disabled={disabled || isSubmitting} type="submit">
        {isSubmitting ? "予約中" : "予約を確定"}
      </Button>
    </form>
  );
}
