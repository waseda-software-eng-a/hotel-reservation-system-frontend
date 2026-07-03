import type { ReservationDao } from "@/app/api/dao/reservationDao";
import type {
  Reservation,
  ReservationCredentials,
  ReservationDetails,
  ReservationDraft,
  ReservationUpdateDraft,
} from "@/app/api/model/reservation";
import { calculateNights } from "@/app/api/service/dateUtils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TableRow } from "@/types/database";

function calculateTotal(row: TableRow<"reservations">): number {
  const nights = calculateNights(row.check_in_date, row.check_out_date);
  return (
    nights *
    (row.booked_room_price_yen * row.room_count + row.booked_adult_surcharge_yen * row.adults)
  );
}

function toReservation(
  row: TableRow<"reservations">,
  guestNames: string[],
  fallback?: ReservationDraft,
): Reservation {
  return {
    id: row.confirmation_code,
    planId: row.plan_id,
    roomId: row.room_type_id,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    adults: row.adults,
    children: row.children,
    roomCount: row.room_count,
    paymentMethod: row.payment_method,
    representativeInfo: {
      email: row.representative_email,
      phone: row.representative_phone,
      postalCode: row.representative_postal_code ?? fallback?.representativeInfo.postalCode ?? "",
      address: row.representative_address ?? fallback?.representativeInfo.address ?? "",
    },
    guestNames,
    status: row.status,
    createdAt: row.created_at,
    totalPrice: calculateTotal(row),
  };
}

export class SupabaseReservationDao implements ReservationDao {
  private async enrich(row: TableRow<"reservations">): Promise<ReservationDetails> {
    const supabase = getSupabaseServerClient();
    const [guestsResult, planResult, roomResult] = await Promise.all([
      supabase
        .from("reservation_guests")
        .select("full_name")
        .eq("reservation_id", row.id)
        .order("sort_order"),
      supabase.from("plans").select("name").eq("id", row.plan_id).single(),
      supabase.from("room_types").select("name").eq("id", row.room_type_id).single(),
    ]);

    const error = guestsResult.error ?? planResult.error ?? roomResult.error;
    if (error || !planResult.data || !roomResult.data) {
      throw new Error(`予約詳細の取得に失敗しました${error ? `: ${error.message}` : "。"}`);
    }

    return {
      ...toReservation(
        row,
        (guestsResult.data ?? []).map((guest) => guest.full_name),
      ),
      planName: planResult.data.name,
      roomName: roomResult.data.name,
      cancellationPolicy: row.cancellation_policy_snapshot,
      cancelledAt: row.cancelled_at,
    };
  }

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

    if (error || !data) throw new Error(error?.message ?? "予約の保存に失敗しました。");
    return toReservation(
      data,
      draft.guestNames.map((name) => name.trim()),
      draft,
    );
  }

  async findByCredentials({
    confirmationCode,
    email,
  }: ReservationCredentials): Promise<ReservationDetails | null> {
    const { data, error } = await getSupabaseServerClient()
      .from("reservations")
      .select("*")
      .eq("confirmation_code", confirmationCode.trim().toUpperCase())
      .ilike("representative_email", email.trim())
      .maybeSingle();

    if (error) throw new Error(`予約の取得に失敗しました: ${error.message}`);
    return data ? this.enrich(data) : null;
  }

  async update(draft: ReservationUpdateDraft): Promise<ReservationDetails> {
    const { data, error } = await getSupabaseServerClient().rpc("update_reservation", {
      p_adults: draft.adults,
      p_check_in_date: draft.checkInDate,
      p_check_out_date: draft.checkOutDate,
      p_children: draft.children,
      p_confirmation_code: draft.confirmationCode,
      p_current_email: draft.email,
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

    if (error || !data) throw new Error(error?.message ?? "予約の変更に失敗しました。");
    return this.enrich(data);
  }

  async cancel(credentials: ReservationCredentials): Promise<ReservationDetails> {
    const { data, error } = await getSupabaseServerClient().rpc("cancel_reservation", {
      p_confirmation_code: credentials.confirmationCode,
      p_email: credentials.email,
    });

    if (error || !data) throw new Error(error?.message ?? "予約のキャンセルに失敗しました。");
    return this.enrich(data);
  }
}
