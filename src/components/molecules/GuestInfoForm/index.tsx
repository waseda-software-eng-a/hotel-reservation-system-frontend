"use client";

import type { ReactNode } from "react";
import Button from "@/components/atoms/Button";
import TextField from "@/components/atoms/TextField";
import type { GuestInfo } from "@/types/reservation";

type GuestInfoFormProps = {
  disabled: boolean;
  guestInfo: GuestInfo;
  isSubmitting: boolean;
  onChange: (guestInfo: GuestInfo) => void;
  onSubmit: () => void;
  beforeSubmit?: ReactNode;
};

export default function GuestInfoForm({
  disabled,
  guestInfo,
  isSubmitting,
  onChange,
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
      <TextField
        disabled={disabled}
        label="氏名"
        onChange={(event) => onChange({ ...guestInfo, fullName: event.target.value })}
        placeholder="山田 太郎"
        required
        value={guestInfo.fullName}
      />
      <TextField
        disabled={disabled}
        label="メールアドレス"
        onChange={(event) => onChange({ ...guestInfo, email: event.target.value })}
        placeholder="guest@example.com"
        required
        type="email"
        value={guestInfo.email}
      />
      <TextField
        disabled={disabled}
        label="電話番号"
        onChange={(event) => onChange({ ...guestInfo, phone: event.target.value })}
        placeholder="09012345678"
        required
        type="tel"
        value={guestInfo.phone}
      />
      {beforeSubmit}
      <Button disabled={disabled || isSubmitting} type="submit">
        {isSubmitting ? "予約中" : "予約を確定"}
      </Button>
    </form>
  );
}
