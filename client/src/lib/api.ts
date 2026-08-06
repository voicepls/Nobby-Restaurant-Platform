/**
 * API client wrapper
 * Base URL: process.env.NEXT_PUBLIC_API_URL
 * Uses ISR (revalidate: 60) for public pages.
 * Admin endpoints require Authorization: Bearer <token> header.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// TODO: implement typed fetch helpers for each resource
// - getMenuCategories()
// - getMenuItems(categoryId?)
// - getGallery()
// - getTestimonials()
// - postReservation(data)
// - postContact(data)
// - admin: CRUD for menu, gallery, testimonials, reservations

export {};
