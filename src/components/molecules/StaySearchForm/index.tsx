"use client";

import { useEffect, useRef, useState } from "react";
import type { AvailabilitySearchParams } from "@/types/reservation";

type DateField = "checkInDate" | "checkOutDate";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

function parseDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const date = parseDate(value);
  if (!date) return "日付を選択";
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDate(left: Date | null, right: Date) {
  return Boolean(left && toDateValue(left) === toDateValue(right));
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-[18px]" viewBox="0 0 18 16">
      <path
        d="M3 6h12v8H3V6Zm10-2V3h2v2H3V3h2v1h1V3h6v1h1Zm-1-3v1H6V1H5v1H2v13h14V2h-3V1h-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-[11px] w-[10px] ${direction === "left" ? "rotate-180" : ""}`}
      viewBox="0 0 10 11"
    >
      <polygon fill="currentColor" points="0.8,10.9 0.2,10.1 7.6,5.5 0.2,0.9 0.8,0.1 9.4,5.5" />
    </svg>
  );
}

function CalendarMonth({
  activeField,
  checkInDate,
  checkOutDate,
  month,
  onSelect,
}: {
  activeField: DateField;
  checkInDate: string;
  checkOutDate: string;
  month: Date;
  onSelect: (date: Date) => void;
}) {
  const firstDay = startOfMonth(month);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay.getDay() + 1;
    return day > 0 && day <= lastDay ? new Date(month.getFullYear(), month.getMonth(), day) : null;
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIn = parseDate(checkInDate);
  const checkOut = parseDate(checkOutDate);

  return (
    <section
      className="min-w-0 flex-1"
      aria-label={`${month.getFullYear()}年${month.getMonth() + 1}月`}
    >
      <h3 className="mb-2 text-center font-serif text-lg text-[#856c34]">
        {month.getFullYear()}年 {month.getMonth() + 1}月
      </h3>
      <div className="grid grid-cols-7 border-b border-[#ccc] text-center text-sm">
        {weekDays.map((day, index) => (
          <span
            className={`pb-2 ${index === 0 || index === 6 ? "text-[#856c34]" : "text-ink"}`}
            key={day}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, index) => {
          if (!date)
            return <span aria-hidden="true" className="h-14 md:h-[68px]" key={`empty-${index}`} />;

          const isPast = date < today;
          const isBeforeCheckIn =
            activeField === "checkOutDate" && Boolean(checkIn && date <= checkIn);
          const isDisabled = isPast || isBeforeCheckIn;
          const isStart = isSameDate(checkIn, date);
          const isEnd = isSameDate(checkOut, date);
          return (
            <button
              aria-label={`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`}
              className={`flex h-14 flex-col items-center justify-center border-b border-[#ccc] px-1 pt-1 text-sm transition md:h-[68px] md:py-1.5 ${
                isStart || isEnd
                  ? "bg-[#856c34] text-white"
                  : isDisabled
                    ? "cursor-not-allowed gap-1.5 text-[#707070]"
                    : "text-ink hover:bg-[#f4f0e7] hover:text-[#856c34]"
              } ${
                (date.getDay() === 0 || date.getDay() === 6) && !isStart && !isEnd && !isDisabled
                  ? "text-[#856c34]"
                  : ""
              }`}
              disabled={isDisabled}
              key={toDateValue(date)}
              onClick={() => onSelect(date)}
              type="button"
            >
              <span className={isDisabled ? "text-[11px]" : "leading-tight"}>{date.getDate()}</span>
              {isDisabled && <span className="text-xs leading-none">×</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

type StaySearchFormProps = {
  isSearching: boolean;
  value: AvailabilitySearchParams;
  onChange: (value: AvailabilitySearchParams) => void;
  onSearch: () => void;
  onClose?: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function StaySearchForm({
  isSearching,
  onChange,
  onClose,
  onSearch,
  value,
}: StaySearchFormProps) {
  const [isGuestPanelOpen, setIsGuestPanelOpen] = useState(false);
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parseDate(value.checkInDate) ?? new Date()),
  );
  const guestPanelRef = useRef<HTMLDivElement>(null);
  const datePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGuestPanelOpen && !activeDateField) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        (!guestPanelRef.current || !guestPanelRef.current.contains(event.target)) &&
        (!datePanelRef.current || !datePanelRef.current.contains(event.target))
      ) {
        setIsGuestPanelOpen(false);
        setActiveDateField(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeDateField, isGuestPanelOpen]);

  function openCalendar(field: DateField) {
    const selectedDate = parseDate(value[field]);
    setVisibleMonth(startOfMonth(selectedDate ?? parseDate(value.checkInDate) ?? new Date()));
    setIsGuestPanelOpen(false);
    setActiveDateField(field);
  }

  function selectDate(date: Date) {
    const selectedValue = toDateValue(date);

    if (activeDateField === "checkInDate") {
      const currentCheckOut = parseDate(value.checkOutDate);
      const nextValue = {
        ...value,
        checkInDate: selectedValue,
        checkOutDate: currentCheckOut && currentCheckOut > date ? value.checkOutDate : "",
      };
      onChange(nextValue);
      setActiveDateField("checkOutDate");
      return;
    }

    onChange({ ...value, checkOutDate: selectedValue });
    setActiveDateField(null);
  }

  function updateCount(key: "adults" | "children" | "roomCount", nextValue: number) {
    const limits = {
      adults: [1, 10],
      children: [0, 6],
      roomCount: [1, 5],
    } as const;
    const [min, max] = limits[key];
    onChange({ ...value, [key]: clamp(nextValue, min, max) });
  }

  return (
    <form
      className="bg-white"
      onSubmit={(event) => {
        event.preventDefault();
        setIsGuestPanelOpen(false);
        setActiveDateField(null);
        onSearch();
      }}
    >
      <div className="relative border-b border-stone-200 px-6 pb-7 pt-8 text-center md:px-12">
        {onClose && (
          <button
            aria-label="予約パネルを閉じる"
            className="absolute right-5 top-5 h-9 w-9 border border-stone-300 text-lg leading-none text-stone-500 transition hover:border-gold hover:text-gold"
            onClick={() => {
              setIsGuestPanelOpen(false);
              onClose();
            }}
            type="button"
          >
            x
          </button>
        )}
        <p className="text-xs font-semibold tracking-[0.28em] text-gold">RESERVATION</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold tracking-normal text-ink">ご予約</h2>
      </div>

      <div className="px-6 py-7 md:px-12 md:py-9">
        <div className="mx-auto mb-8 max-w-md border border-gold">
          <button
            className="w-full bg-gold px-6 py-4 text-sm font-semibold tracking-[0.14em] text-white"
            type="button"
          >
            宿泊予約
          </button>
        </div>

        <div className="grid gap-6">
          <div className="relative" ref={datePanelRef}>
            <div className="grid gap-6 md:grid-cols-2 md:gap-4">
              {(
                [
                  ["checkInDate", "チェックイン"],
                  ["checkOutDate", "チェックアウト"],
                ] as const
              ).map(([field, label]) => (
                <div className="flex flex-col gap-1 text-sm text-ink" key={field}>
                  <span className={activeDateField === field ? "text-[#856c34]" : ""}>{label}</span>
                  <span className="border-b border-[#7a7a7a] pb-1 focus-within:outline focus-within:outline-2 focus-within:outline-current">
                    <button
                      aria-expanded={activeDateField === field}
                      aria-haspopup="dialog"
                      className="flex h-10 w-full items-center justify-between bg-transparent text-left text-sm"
                      onClick={() => openCalendar(field)}
                      type="button"
                    >
                      <span className={value[field] ? "text-ink" : "text-[#8e8e94]"}>
                        {value[field] ? formatDate(value[field]) : ""}
                      </span>
                      <span className="mr-1 text-[#856c34]">
                        <CalendarIcon />
                      </span>
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {activeDateField && (
              <div
                aria-label="宿泊日を選択"
                aria-modal="false"
                className="absolute -left-[35px] top-[72px] z-30 flex w-[calc(100%+70px)] flex-col-reverse gap-4 border border-[#ccc] bg-white px-4 py-6 shadow-[0_14px_35px_rgba(33,31,27,0.12)] md:left-0 md:top-[78px] md:w-full md:gap-5 md:px-[clamp(8px,4vw,38px)] md:pb-6 md:pt-8"
                role="dialog"
              >
                <p className="text-xs text-ink">×：予約不可</p>
                <div className="relative">
                  <button
                    aria-label="前の月を表示"
                    className="absolute -top-1 left-0 z-10 grid h-11 w-11 place-items-center bg-transparent text-[#856c34]"
                    onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
                    type="button"
                  >
                    <ChevronIcon direction="left" />
                  </button>
                  <button
                    aria-label="次の月を表示"
                    className="absolute -top-1 right-0 z-10 grid h-11 w-11 place-items-center bg-transparent text-[#856c34]"
                    onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
                    type="button"
                  >
                    <ChevronIcon direction="right" />
                  </button>
                  <div className="flex gap-3 md:gap-[clamp(12px,5vw,60px)]">
                    <CalendarMonth
                      activeField={activeDateField}
                      checkInDate={value.checkInDate}
                      checkOutDate={value.checkOutDate}
                      month={visibleMonth}
                      onSelect={selectDate}
                    />
                    <div className="hidden flex-1 md:block">
                      <CalendarMonth
                        activeField={activeDateField}
                        checkInDate={value.checkInDate}
                        checkOutDate={value.checkOutDate}
                        month={addMonths(visibleMonth, 1)}
                        onSelect={selectDate}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative grid gap-2 text-sm font-semibold text-ink" ref={guestPanelRef}>
            <span>宿泊人数・客室数</span>
            <button
              className="flex h-14 items-center justify-between border border-stone-300 bg-white px-4 text-left text-sm font-semibold text-ink transition hover:border-gold"
              onClick={() => {
                setActiveDateField(null);
                setIsGuestPanelOpen((isOpen) => !isOpen);
              }}
              type="button"
            >
              <span>
                大人{value.adults}名 子ども{value.children}名 | {value.roomCount}室
              </span>
              <span aria-hidden className="text-gold">
                v
              </span>
            </button>

            {isGuestPanelOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 border border-stone-300 bg-white p-5 shadow-soft">
                {[
                  { key: "adults" as const, label: "大人", subLabel: "13歳以上", min: 1, max: 10 },
                  {
                    key: "children" as const,
                    label: "子ども",
                    subLabel: "0から12歳",
                    min: 0,
                    max: 6,
                  },
                  {
                    key: "roomCount" as const,
                    label: "客室数",
                    subLabel: "同一タイプ",
                    min: 1,
                    max: 5,
                  },
                ].map((item) => {
                  const count = value[item.key];

                  return (
                    <div
                      className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-stone-200 py-4 last:border-b-0"
                      key={item.key}
                    >
                      <div>
                        <p className="text-sm font-bold text-ink">{item.label}</p>
                        <p className="mt-1 text-xs font-normal text-stone-500">{item.subLabel}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="h-9 w-9 border border-stone-300 text-lg text-gold disabled:opacity-30"
                          disabled={count <= item.min}
                          onClick={() => updateCount(item.key, count - 1)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{count}</span>
                        <button
                          className="h-9 w-9 border border-stone-300 text-lg text-gold disabled:opacity-30"
                          disabled={count >= item.max}
                          onClick={() => updateCount(item.key, count + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 grid gap-5 border-t border-stone-200 pt-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-gold">
            <a href="#rooms">空室カレンダー</a>
            <a href="#rooms">予約確認・変更・取消</a>
          </div>
          <button
            className="min-h-14 bg-gold px-10 text-sm font-bold tracking-[0.14em] text-white transition hover:bg-deepGreen disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSearching}
            type="submit"
          >
            {isSearching ? "検索中" : "検索する"}
          </button>
        </div>
      </div>
    </form>
  );
}
