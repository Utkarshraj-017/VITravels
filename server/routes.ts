import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRideSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

// Simple session store for demo (in production, use proper session management)
const sessions: Map<string, string> = new Map();

// Middleware to get current user from session
const getCurrentUser = async (req: Request): Promise<string | null> => {
  const sessionId = req.headers["x-session-id"] as string;
  if (!sessionId) return null;
  return sessions.get(sessionId) || null;
};

// Auth middleware
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = await getCurrentUser(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as any).userId = userId;
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ AUTH ROUTES ============

  // Login/Register
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);

      if (!user) {
        // Create new user
        const validatedData = insertUserSchema.parse({ email, name });
        user = await storage.createUser(validatedData);
      }

      // Create session
      const sessionId = crypto.randomUUID();
      sessions.set(sessionId, user.id);

      res.json({ ...user, sessionId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    const userId = await getCurrentUser(req);
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    const sessionId = req.headers["x-session-id"] as string;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  // ============ RIDE ROUTES ============

  // Get all rides with optional filters
  app.get("/api/rides", async (req, res) => {
    try {
      const { from, to, date, vehicleType } = req.query;

      const rides = await storage.getAllRides({
        from: from as string,
        to: to as string,
        date: date as string,
        vehicleType: vehicleType as string,
      });

      // Attach creator info to each ride
      const ridesWithCreators = await Promise.all(
        rides.map(async (ride) => {
          const creator = await storage.getUser(ride.creatorId);
          return { ...ride, creator };
        })
      );

      res.json(ridesWithCreators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rides" });
    }
  });

  // Get rides created by current user
  app.get("/api/rides/my", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const rides = await storage.getRidesByCreator(userId);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your rides" });
    }
  });

  // Get single ride
  app.get("/api/rides/:id", async (req, res) => {
    try {
      const ride = await storage.getRide(req.params.id);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }

      const creator = await storage.getUser(ride.creatorId);
      res.json({ ...ride, creator });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ride" });
    }
  });

  // Create ride
  app.post("/api/rides", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;

      // Parse and validate with Zod schema
      const rideInput = {
        ...req.body,
        availableSeats: Number(req.body.availableSeats),
        pricePerHead: Number(req.body.pricePerHead),
        additionalMsg: req.body.additionalMsg || "",
      };

      const validatedData = insertRideSchema.parse(rideInput);
      const ride = await storage.createRide(validatedData, userId);
      res.status(201).json(ride);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create ride" });
    }
  });

  // Update ride
  app.patch("/api/rides/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const ride = await storage.getRide(req.params.id);

      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }

      if (ride.creatorId !== userId) {
        return res.status(403).json({ error: "Not authorized to update this ride" });
      }

      // Pass false for autoUpdateStatus to preserve manual status changes by creator
      const updatedRide = await storage.updateRide(req.params.id, req.body, false);
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ride" });
    }
  });

  // Delete ride
  app.delete("/api/rides/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const ride = await storage.getRide(req.params.id);

      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }

      if (ride.creatorId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this ride" });
      }

      await storage.deleteRide(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ride" });
    }
  });

  // ============ BOOKING ROUTES ============

  // Get user's bookings
  app.get("/api/bookings/my", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const bookings = await storage.getBookingsByUser(userId);

      // Attach ride and creator info to each booking
      const bookingsWithRides = await Promise.all(
        bookings.map(async (booking) => {
          const ride = await storage.getRide(booking.rideId);
          if (ride) {
            const creator = await storage.getUser(ride.creatorId);
            return { ...booking, ride: { ...ride, creator } };
          }
          return { ...booking, ride: null };
        })
      );

      res.json(bookingsWithRides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Create booking
  app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { rideId, seatsBooked } = req.body;

      // Validate input
      const validatedData = insertBookingSchema.parse({ rideId, seatsBooked });

      // Get the ride
      const ride = await storage.getRide(rideId);
      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }

      // Check if user is the creator
      if (ride.creatorId === userId) {
        return res.status(400).json({ error: "Cannot book your own ride" });
      }

      // Check if ride has enough seats
      if (ride.availableSeats < seatsBooked) {
        return res.status(400).json({ error: "Not enough seats available" });
      }

      // Check if ride is still open
      if (ride.status === "FULL") {
        return res.status(400).json({ error: "This ride is fully booked" });
      }

      // Create the booking
      const booking = await storage.createBooking(
        validatedData,
        userId,
        ride.pricePerHead
      );

      // Update ride seats
      await storage.updateRide(rideId, {
        availableSeats: ride.availableSeats - seatsBooked,
      });

      // Fetch ride info for response
      const updatedRide = await storage.getRide(rideId);
      const creator = await storage.getUser(ride.creatorId);

      res.status(201).json({
        ...booking,
        ride: { ...updatedRide, creator },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Cancel booking
  app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const booking = await storage.getBooking(req.params.id);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to cancel this booking" });
      }

      if (booking.status === "CANCELLED") {
        return res.status(400).json({ error: "Booking already cancelled" });
      }

      // Cancel the booking
      const cancelledBooking = await storage.cancelBooking(req.params.id);

      // Restore ride seats
      const ride = await storage.getRide(booking.rideId);
      if (ride) {
        await storage.updateRide(booking.rideId, {
          availableSeats: ride.availableSeats + booking.seatsBooked,
        });
      }

      res.json(cancelledBooking);
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  });

  return httpServer;
}
