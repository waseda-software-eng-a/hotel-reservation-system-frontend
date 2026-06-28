export type RoomType = "single" | "double" | "twin" | "suite";
export type BedType = "single" | "double" | "twin";
export type MealType = "room-only" | "breakfast" | "half-board";
export type PaymentMethod = "onsite" | "web";

export type Room = {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  amenities: string[];
  imageUrl: string;
  description: string;
  wing: string;
  floor: string;
  sizeSqm: number;
  bedType: BedType;
};

export type AvailableRoom = Room & {
  availableCount: number;
  nights: number;
  totalPrice: number;
};

export type Plan = {
  id: string;
  name: string;
  summary: string;
  mealType: MealType;
  paymentMethods: PaymentMethod[];
  checkInTime: string;
  checkOutTime: string;
  tags: string[];
  cancellationPolicy: string;
  imageUrl: string;
};

export type AvailablePlan = Plan & {
  rooms: AvailableRoom[];
  lowestTotalPrice: number;
};

export type AvailabilitySearchParams = {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomCount: number;
};

export type RepresentativeInfo = {
  email: string;
  phone: string;
  postalCode: string;
  address: string;
};

export type ReservationDraft = {
  planId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomCount: number;
  paymentMethod: PaymentMethod;
  termsAccepted: boolean;
  representativeInfo: RepresentativeInfo;
  guestNames: string[];
};

export type Reservation = {
  id: string;
  planId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomCount: number;
  paymentMethod: PaymentMethod;
  representativeInfo: RepresentativeInfo;
  guestNames: string[];
  status: "confirmed";
  createdAt: string;
  totalPrice: number;
};
