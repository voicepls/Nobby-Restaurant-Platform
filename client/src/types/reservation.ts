// TypeScript types for Reservations
export interface Reservation {
  id: number;
  name: string;
  phone: string;
  partySize: number;
  reservationTime: string; // ISO 8601
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
