import type { AvailabilityDao } from "@/app/api/dao/availabilityDao";
import type { AvailabilitySearchParams } from "@/app/api/model/reservation";
import type { AvailablePlan } from "@/app/api/model/room";
import { badRequest } from "@/app/api/service/apiError";
import { isValidStayRange } from "@/app/api/service/dateUtils";

export class AvailabilityService {
  constructor(private readonly availabilityDao: AvailabilityDao) {}

  async search(params: AvailabilitySearchParams): Promise<AvailablePlan[]> {
    if (!params.checkInDate || !params.checkOutDate) {
      throw badRequest("宿泊日を入力してください。");
    }

    if (!isValidStayRange(params.checkInDate, params.checkOutDate)) {
      throw badRequest("チェックアウト日はチェックイン日より後にしてください。");
    }

    if (!Number.isInteger(params.adults) || params.adults < 1) {
      throw badRequest("大人の人数は1名以上で入力してください。");
    }

    if (!Number.isInteger(params.children) || params.children < 0) {
      throw badRequest("子どもの人数を確認してください。");
    }

    if (!Number.isInteger(params.roomCount) || params.roomCount < 1) {
      throw badRequest("客室数は1室以上で入力してください。");
    }

    return this.availabilityDao.findAvailablePlans(params);
  }
}
