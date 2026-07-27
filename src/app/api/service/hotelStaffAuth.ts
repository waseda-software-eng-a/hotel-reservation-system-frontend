import { badRequest } from "@/app/api/service/apiError";

const DEFAULT_STAFF_KEY = "waseriko-staff";

export function getExpectedHotelStaffKey(): string {
  return process.env.HOTEL_STAFF_KEY?.trim() || DEFAULT_STAFF_KEY;
}

export function assertHotelStaff(request: Request) {
  const provided = request.headers.get("x-hotel-staff-key")?.trim() ?? "";
  if (!provided || provided !== getExpectedHotelStaffKey()) {
    throw badRequest("ホテルスタッフキーが正しくありません。");
  }
}
