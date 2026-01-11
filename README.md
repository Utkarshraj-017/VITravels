# VITravels – Student Ride Sharing Platform

## Overview

VITravels is a ride-sharing web application designed for VIT Bhopal students.  
The platform enables students to create, discover, and book rides with fellow students traveling to similar destinations.

The application follows a **mobile-first design** with a focus on clarity, efficiency, and student safety.

### Core Features
- Email-based user authentication
- Create and manage ride listings
- Search and filter available rides
- Book seats on existing rides
- WhatsApp integration for ride coordination

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **UI Library:** shadcn/ui (Radix UI)

---

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack React Query (server state)
- **UI Components:** shadcn/ui built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables
- **Build Tool:** Vite with Hot Module Replacement

The frontend follows a pages-based structure with protected routes.  
Authentication state is managed through a custom React context (`AuthProvider`) and persisted using `localStorage`.

---

### Backend Architecture
- **Framework:** Express.js with TypeScript
- **API Pattern:** RESTful JSON API (`/api` prefix)
- **Session Management:** Custom session handling with header-based session IDs
- **Validation:** Zod schemas shared between frontend and backend

The backend handles authentication, ride CRUD operations, and booking management.  
All routes are registered in a centralized `routes.ts` file with authentication middleware.

---

### Data Storage
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM with Zod integration
- **Configuration:** Database connection via `DATABASE_URL`
- **Schema Location:** `shared/schema.ts`

A fallback in-memory storage implementation is available for development and testing.

#### Core Entities
- **Users:** id, name, email, avatar, createdAt
- **Rides:** id, creatorId, from, to, date, time, vehicleType, seats, price, whatsappLink, status
- **Bookings:** id, rideId, userId, status, pricePerHead, bookedAt

---

### Shared Code
The `shared/` directory contains Zod schemas used by both the frontend and backend, ensuring strict type consistency across the application.  
Insert schemas validate client input, while full schemas include server-generated fields.

---

## Build Process

- **Development**
  - Vite dev server with HMR
  - Backend server runs alongside frontend
  - Frontend requests are proxied through Express

- **Production**
  - Vite builds static assets to `dist/public`
  - Backend is bundled to `dist/index.cjs`
  - Single deployment unit (frontend + backend together)

---

## Getting Started

### Prerequisites
- Node.js **v20+** (Node 22 supported with minor compatibility fixes)
- PostgreSQL database (Neon recommended)

### Setup
### Prerequisites
- Node.js v20 or newer
- PostgreSQL database (Neon recommended)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Utkarshraj-017/VITravels.git
   cd VITravels
2. Create a .env file in the project root:
```

DATABASE_URL=your_postgresql_connection_string
PORT=5000
NODE_ENV=development
```
3. Install dependencies:

```
npm install
```
4. Push database schema:
```
npx drizzle-kit push
```
5. Start the development server:
```
npm run dev
```
