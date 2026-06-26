"use client";

import Button from "@/components/atoms/Button";
import SelectField from "@/components/atoms/SelectField";
import TextField from "@/components/atoms/TextField";
import type { AvailabilitySearchParams } from "@/types/reservation";

type StaySearchFormProps = {
  isSearching: boolean;
  value: AvailabilitySearchParams;
  onChange: (value: AvailabilitySearchParams) => void;
  onSearch: () => void;
};

const guestOptions = [
  { label: "1名", value: "1" },
  { label: "2名", value: "2" },
  { label: "3名", value: "3" },
  { label: "4名", value: "4" },
];

export default function StaySearchForm({
  isSearching,
  onChange,
  onSearch,
  value,
}: StaySearchFormProps) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="チェックイン"
          onChange={(event) => onChange({ ...value, checkInDate: event.target.value })}
          required
          type="date"
          value={value.checkInDate}
        />
        <TextField
          label="チェックアウト"
          onChange={(event) => onChange({ ...value, checkOutDate: event.target.value })}
          required
          type="date"
          value={value.checkOutDate}
        />
      </div>
      <SelectField
        label="人数"
        onChange={(event) => onChange({ ...value, guests: Number(event.target.value) })}
        options={guestOptions}
        value={String(value.guests)}
      />
      <Button disabled={isSearching} type="submit">
        {isSearching ? "検索中" : "空室を検索"}
      </Button>
    </form>
  );
}
