import type { User, InsertUser, Ride, InsertRide, Booking, InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Rides
  getRide(id: string): Promise<Ride | undefined>;
  getAllRides(filters?: {
    from?: string;
    to?: string;
    date?: string;
    vehicleType?: string;
  }): Promise<Ride[]>;
  getRidesByCreator(creatorId: string): Promise<Ride[]>;
  createRide(ride: InsertRide, creatorId: string): Promise<Ride>;
  updateRide(id: string, updates: Partial<Ride>, autoUpdateStatus?: boolean): Promise<Ride | undefined>;
  deleteRide(id: string): Promise<boolean>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByRide(rideId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking, userId: string, pricePerHead: number): Promise<Booking>;
  cancelBooking(id: string): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rides: Map<string, Ride>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.users = new Map();
    this.rides = new Map();
    this.bookings = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      avatar: insertUser.avatar,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  // Rides
  async getRide(id: string): Promise<Ride | undefined> {
    return this.rides.get(id);
  }

  async getAllRides(filters?: {
    from?: string;
    to?: string;
    date?: string;
    vehicleType?: string;
  }): Promise<Ride[]> {
    let rides = Array.from(this.rides.values());

    // Sort by date (newest first)
    rides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters) {
      if (filters.from) {
        rides = rides.filter((r) =>
          r.from.toLowerCase().includes(filters.from!.toLowerCase())
        );
      }
      if (filters.to) {
        rides = rides.filter((r) =>
          r.to.toLowerCase().includes(filters.to!.toLowerCase())
        );
      }
      if (filters.date) {
        rides = rides.filter((r) => r.date === filters.date);
      }
      if (filters.vehicleType && filters.vehicleType !== "all") {
        rides = rides.filter((r) => r.vehicleType === filters.vehicleType);
      }
    }

    return rides;
  }

  async getRidesByCreator(creatorId: string): Promise<Ride[]> {
    return Array.from(this.rides.values())
      .filter((r) => r.creatorId === creatorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createRide(insertRide: InsertRide, creatorId: string): Promise<Ride> {
    const id = randomUUID();
    const ride: Ride = {
      id,
      creatorId,
      from: insertRide.from,
      to: insertRide.to,
      date: insertRide.date,
      time: insertRide.time,
      vehicleType: insertRide.vehicleType,
      availableSeats: insertRide.availableSeats,
      totalSeats: insertRide.availableSeats,
      pricePerHead: insertRide.pricePerHead,
      whatsappLink: insertRide.whatsappLink,
      additionalMsg: insertRide.additionalMsg,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    this.rides.set(id, ride);
    return ride;
  }

  async updateRide(id: string, updates: Partial<Ride>, autoUpdateStatus = true): Promise<Ride | undefined> {
    const ride = this.rides.get(id);
    if (!ride) return undefined;

    const updatedRide = { ...ride, ...updates };
    
    // Only auto-update status when seats are being changed and autoUpdateStatus is true
    // This preserves manual status changes made by the ride creator
    if (autoUpdateStatus && updates.availableSeats !== undefined) {
      if (updatedRide.availableSeats <= 0) {
        updatedRide.status = "FULL";
      } else if (ride.status === "FULL" && updatedRide.availableSeats > 0) {
        // Only reopen if it was automatically closed due to seats
        updatedRide.status = "OPEN";
      }
    }

    this.rides.set(id, updatedRide);
    return updatedRide;
  }

  async deleteRide(id: string): Promise<boolean> {
    return this.rides.delete(id);
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
  }

  async getBookingsByRide(rideId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter((b) => b.rideId === rideId);
  }

  async createBooking(
    insertBooking: InsertBooking,
    userId: string,
    pricePerHead: number
  ): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      id,
      rideId: insertBooking.rideId,
      userId,
      seatsBooked: insertBooking.seatsBooked,
      status: "BOOKED",
      totalPrice: insertBooking.seatsBooked * pricePerHead,
      bookedAt: new Date().toISOString(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async cancelBooking(id: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const cancelledBooking: Booking = {
      ...booking,
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
    };
    this.bookings.set(id, cancelledBooking);
    return cancelledBooking;
  }
}

export const storage = new MemStorage();
