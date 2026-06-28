import { SupabaseAvailabilityDao } from "@/app/api/dao/supabase/supabaseAvailabilityDao";
import { SupabaseReservationDao } from "@/app/api/dao/supabase/supabaseReservationDao";

export const availabilityDao = new SupabaseAvailabilityDao();
export const reservationDao = new SupabaseReservationDao();
