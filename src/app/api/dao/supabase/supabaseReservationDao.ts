import type { ReservationDao } from "@/app/api/dao/reservationDao";
import type { Reservation, ReservationDraft } from "@/app/api/model/reservation";
import { calculateNights } from "@/app/api/service/dateUtils";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export class SupabaseReservationDao implements ReservationDao {
  async create(draft: ReservationDraft): Promise<Reservation> {
    const { data, error } = await getSupabaseServerClient().rpc("create_reservation", {
      p_adults: draft.adults,
      p_check_in_date: draft.checkInDate,
      p_check_out_date: draft.checkOutDate,
      p_children: draft.children,
      p_guest_names: draft.guestNames,
      p_payment_method: draft.paymentMethod,
      p_plan_id: draft.planId,
      p_representative_address: draft.representativeInfo.address,
      p_representative_email: draft.representativeInfo.email,
      p_representative_phone: draft.representativeInfo.phone,
      p_representative_postal_code: draft.representativeInfo.postalCode,
      p_room_count: draft.roomCount,
      p_room_type_id: draft.roomId,
    });

    if (error || !data) {
      throw new Error(error?.message ?? "予約の保存に失敗しました。");
    }

    const nights = calculateNights(data.check_in_date, data.check_out_date);
    const totalPrice =
      nights *
      (data.booked_room_price_yen * data.room_count +
        data.booked_adult_surcharge_yen * data.adults);

    return {
      id: data.confirmation_code,
      planId: data.plan_id,
      roomId: data.room_type_id,
      checkInDate: data.check_in_date,
      checkOutDate: data.check_out_date,
      adults: data.adults,
      children: data.children,
      roomCount: data.room_count,
      paymentMethod: data.payment_method,
      representativeInfo: {
        email: data.representative_email,
        phone: data.representative_phone,
        postalCode: data.representative_postal_code ?? draft.representativeInfo.postalCode,
        address: data.representative_address ?? draft.representativeInfo.address,
      },
      guestNames: draft.guestNames.map((name) => name.trim()),
      status: "confirmed",
      createdAt: data.created_at,
      totalPrice,
    };
  }
}
