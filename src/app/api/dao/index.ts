import { MemoryChatDao } from "@/app/api/dao/memory/memoryChatDao";
import { MemorySiteContentDao } from "@/app/api/dao/memory/memorySiteContentDao";
import { SupabaseAvailabilityDao } from "@/app/api/dao/supabase/supabaseAvailabilityDao";
import { SupabaseReservationDao } from "@/app/api/dao/supabase/supabaseReservationDao";

export const availabilityDao = new SupabaseAvailabilityDao();
export const reservationDao = new SupabaseReservationDao();
export const chatDao = new MemoryChatDao();
export const siteContentDao = new MemorySiteContentDao();
