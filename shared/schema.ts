import { z } from "zod";

// User Schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const insertUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  avatar: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Ride Schema
export const rideSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  from: z.string(),
  to: z.string(),
  date: z.string(),
  time: z.string(),
  vehicleType: z.enum(["car", "bike", "auto", "bus"]),
  availableSeats: z.number().int().min(1),
  totalSeats: z.number().int().min(1),
  pricePerHead: z.number().min(0),
  whatsappLink: z.string().url(),
  additionalMsg: z.string().optional(),
  status: z.enum(["OPEN", "FULL"]),
  createdAt: z.string(),
});

export type Ride = z.infer<typeof rideSchema>;

export const insertRideSchema = z.object({
  from: z.string().min(2, "From location is required"),
  to: z.string().min(2, "To location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  vehicleType: z.enum(["car", "bike", "auto", "bus"]),
  availableSeats: z.number().int().min(1, "Must have at least 1 seat"),
  pricePerHead: z.number().min(0, "Price cannot be negative"),
  whatsappLink: z.string().min(1, "WhatsApp link is required"),
  additionalMsg: z.string().optional(),
});

export type InsertRide = z.infer<typeof insertRideSchema>;

// Booking Schema
export const bookingSchema = z.object({
  id: z.string(),
  rideId: z.string(),
  userId: z.string(),
  seatsBooked: z.number().int().min(1),
  status: z.enum(["BOOKED", "CANCELLED"]),
  totalPrice: z.number().min(0),
  bookedAt: z.string(),
  cancelledAt: z.string().optional(),
});

export type Booking = z.infer<typeof bookingSchema>;

export const insertBookingSchema = z.object({
  rideId: z.string(),
  seatsBooked: z.number().int().min(1, "Must book at least 1 seat"),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
