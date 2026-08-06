// TypeScript types for Testimonials
export interface Testimonial {
  id: number;
  guestName: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}
