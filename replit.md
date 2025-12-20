# VITravels - Student Ride Sharing Platform

## Overview

VITravels is a ride-sharing web application designed for VIT Bhopal students. The platform enables students to create, discover, and book rides with fellow students traveling to similar destinations. The application follows a mobile-first design approach with a focus on clarity, efficiency, and student safety.

**Core Features:**
- User authentication with email-based login
- Create and manage ride listings
- Search and filter available rides
- Book seats on existing rides
- WhatsApp integration for ride coordination

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack React Query for server state
- **UI Components:** shadcn/ui component library built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming
- **Build Tool:** Vite with hot module replacement

The frontend follows a pages-based structure with protected routes. Authentication state is managed through a custom React context (`AuthProvider`) that persists session data in localStorage.

### Backend Architecture
- **Framework:** Express.js with TypeScript
- **API Pattern:** RESTful JSON API with `/api` prefix
- **Session Management:** Custom session handling with header-based session IDs
- **Validation:** Zod schemas shared between client and server

The server handles authentication, ride CRUD operations, and booking management. Routes are registered in a centralized `routes.ts` file with middleware for authentication protection.

### Data Storage
- **ORM:** Drizzle ORM with Zod integration for type-safe schemas
- **Database:** PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location:** `shared/schema.ts` contains all entity definitions
- **Fallback:** In-memory storage implementation available for development

**Core Entities:**
- Users (id, name, email, avatar, createdAt)
- Rides (id, creatorId, from, to, date, time, vehicleType, seats, price, whatsappLink, status)
- Bookings (id, rideId, userId, status, pricePerHead, bookedAt)

### Shared Code
The `shared/` directory contains Zod schemas used by both frontend and backend, ensuring type consistency across the full stack. Insert schemas validate input data while full schemas include server-generated fields.

### Build Process
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds static assets to `dist/public`, esbuild bundles server to `dist/index.cjs`

## External Dependencies

### Database
- PostgreSQL database connection via `DATABASE_URL` environment variable
- Drizzle Kit for database migrations (`npm run db:push`)

### Third-Party UI Libraries
- Radix UI primitives for accessible components
- Embla Carousel for carousel functionality
- React Day Picker for calendar/date selection
- Lucide React for icons
- React Icons (WhatsApp icon specifically)

### Form Handling
- React Hook Form with Zod resolver for form validation

### Utilities
- date-fns for date formatting
- clsx and tailwind-merge for class name handling
- nanoid for unique ID generation