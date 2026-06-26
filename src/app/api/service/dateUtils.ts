export function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(`${checkInDate}T00:00:00`);
  const checkOut = new Date(`${checkOutDate}T00:00:00`);
  const diff = checkOut.getTime() - checkIn.getTime();
  return Math.max(Math.ceil(diff / 86400000), 0);
}

export function isValidStayRange(checkInDate: string, checkOutDate: string): boolean {
  return calculateNights(checkInDate, checkOutDate) > 0;
}
