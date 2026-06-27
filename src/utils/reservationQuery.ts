import type { AvailabilitySearchParams } from "@/types/reservation";

type SearchParamReader = {
  get(name: string): string | null;
};

export function readAvailabilityParams(params: SearchParamReader): AvailabilitySearchParams {
  return {
    hotelId: params.get("hotelId") ?? "waseda-tokyo",
    checkInDate: params.get("checkInDate") ?? "",
    checkOutDate: params.get("checkOutDate") ?? "",
    adults: Number(params.get("adults") ?? "2"),
    children: Number(params.get("children") ?? "0"),
    roomCount: Number(params.get("roomCount") ?? "1"),
  };
}

export function createAvailabilityQuery(params: AvailabilitySearchParams) {
  return new URLSearchParams({
    hotelId: params.hotelId,
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    adults: String(params.adults),
    children: String(params.children),
    roomCount: String(params.roomCount),
  });
}

export function formatStayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "未選択";
  const date = new Date(year, month - 1, day);
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${month}/${day}(${weekDays[date.getDay()]})`;
}
