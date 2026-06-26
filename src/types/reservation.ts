export type RoomType = "single" | "double" | "twin" | "suite";

export type Room = {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  totalRooms: number;
  amenities: string[];
  imageLabel: string;
};

export type AvailableRoom = Room & {
  availableCount: number;
  nights: number;
  totalPrice: number;
};

export type AvailabilitySearchParams = {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
};

export type GuestInfo = {
  fullName: string;
  email: string;
  phone: string;
};

export type ReservationDraft = {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  guestInfo: GuestInfo;
};

export type Reservation = ReservationDraft & {
  id: string;
  status: "confirmed";
  createdAt: string;
};
