export type RoomType = "single" | "double" | "twin" | "suite";
export type BedType = "single" | "double" | "twin";
export type MealType = "room-only" | "breakfast" | "half-board";
export type PaymentMethod = "onsite" | "web";

export type Hotel = {
  id: string;
  name: string;
  area: string;
};

export type Room = {
  id: string;
  hotelId: string;
  name: string;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  totalRooms: number;
  amenities: string[];
  imageLabel: string;
  imageUrl: string;
  description: string;
  wing: string;
  floor: string;
  sizeSqm: number;
  bedType: BedType;
  isNonSmoking: boolean;
  hasWifi: boolean;
};

export type AvailableRoom = Room & {
  availableCount: number;
  nights: number;
  totalPrice: number;
};

export type Plan = {
  id: string;
  hotelId: string;
  name: string;
  summary: string;
  mealType: MealType;
  paymentMethods: PaymentMethod[];
  checkInTime: string;
  checkOutTime: string;
  tags: string[];
  roomIds: string[];
  priceAdjustmentPerAdult: number;
  cancellationPolicy: string;
  imageUrl: string;
};

export type AvailablePlan = Plan & {
  rooms: AvailableRoom[];
  lowestTotalPrice: number;
};

export type AvailabilitySearchParams = {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomCount: number;
};

export type GuestInfo = {
  fullName: string;
  email: string;
  phone: string;
};

export type ReservationDraft = {
  hotelId: string;
  planId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomCount: number;
  guestInfo: GuestInfo;
};

export type Reservation = ReservationDraft & {
  id: string;
  status: "confirmed";
  createdAt: string;
  totalPrice: number;
};
