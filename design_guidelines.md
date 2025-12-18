# VITravels Design Guidelines

## Design Approach
**Selected System:** Material Design principles with modern web application patterns
**Justification:** Utility-focused ride-sharing platform requiring clarity, efficiency, and mobile-first design for student users on-the-go.

**Key Design Principles:**
- Mobile-first responsive design (students primarily use phones)
- Clear information hierarchy for quick ride scanning
- Trustworthy, professional aesthetic for student safety
- Efficient booking flows with minimal friction

## Typography

**Font Family:** Inter or Manrope (Google Fonts)
- **Headings:** 
  - H1: text-4xl md:text-5xl, font-bold (Page titles)
  - H2: text-2xl md:text-3xl, font-semibold (Section headers)
  - H3: text-xl md:text-2xl, font-semibold (Card titles)
- **Body Text:** text-base, font-normal (Descriptions, details)
- **Labels:** text-sm, font-medium (Form labels, metadata)
- **Captions:** text-xs (Timestamps, helper text)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 md:p-6
- Section spacing: space-y-8 md:space-y-12
- Card gaps: gap-4 md:gap-6
- Container max-width: max-w-7xl mx-auto px-4

**Grid System:**
- Dashboard/Trips: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Filters: Single column on mobile, horizontal row on desktop
- My Bookings: Single column list view

## Component Library

### Navigation
**Navbar:**
- Sticky top navbar with shadow-sm
- Logo left, navigation links center, user profile/logout right
- Mobile: Hamburger menu with slide-out drawer
- Height: h-16, items centered vertically

### Authentication
**Login Page:**
- Centered card layout (max-w-md mx-auto)
- Large "Sign in with Google" button with Google icon
- VIT Bhopal branding/logo at top
- Simple, focused single-purpose design

### Dashboard
**Hero Section:**
- Clean welcome banner with user name
- Quick stats row: "Active Rides", "My Bookings", "Seats Shared" (3-column grid)
- Primary CTA: "Create New Ride" button (prominent size)

**Recent Rides Section:**
- Grid of TripCard components
- "View All Rides" link

### TripCard Component
**Layout:**
- Bordered card with rounded-lg, shadow hover effect
- Header: From → To (bold), Date & Time
- Body: Vehicle type icon + text, Available seats badge, Price per head (emphasized)
- Footer: Creator info (small avatar + name), WhatsApp button, Book button
- Status badge (OPEN/FULL) in top-right corner

### Create Ride Page
**Form Layout:**
- Single column form with max-w-2xl mx-auto
- Grouped sections: Journey Details, Vehicle Info, Contact
- Input fields with labels above, helper text below
- Icon prefixes for inputs (location pin, calendar, etc.)
- Large "Create Ride" submit button at bottom

### Trips Page (Filtering)
**Filter Section:**
- Horizontal filter bar on desktop (sticky below navbar)
- Mobile: Expandable filter drawer with "Filter" button
- Filters: From dropdown, To dropdown, Date picker, Vehicle type chips
- "Clear Filters" and "Apply" buttons

**Results Grid:**
- Same TripCard grid as Dashboard
- Empty state illustration + message when no results

### My Bookings Page
**List View:**
- Timeline-style list (most recent first)
- Each booking card shows: Ride details, Booking status badge, Cancel button (if active)
- Tabs for "Active" and "Past" bookings

### Buttons & CTAs
- **Primary:** Solid, rounded-md, px-6 py-3, font-medium
- **Secondary:** Outline style, same size
- **Icon buttons:** Circular for WhatsApp link, square-md for actions
- **Destructive:** For cancel actions

### Form Elements
- Input fields: border rounded-md, px-4 py-2.5, focus ring
- Select dropdowns: Consistent styling with inputs
- Date picker: Calendar icon, clear visual feedback
- Validation: Inline error messages below fields (text-sm)

### Alerts & Toasts
- Toast notifications for success/error (top-right position)
- Duration: 3-4 seconds auto-dismiss
- Icons: Checkmark (success), X (error), Info (neutral)

## Images

**Login Page:** Simple abstract illustration of students sharing rides (max-w-sm, centered above form)

**Dashboard Hero:** Wide banner image (h-48) showing diverse students traveling together, overlaid with semi-transparent gradient for text readability

**Empty States:** Minimalist illustrations for "No rides found", "No bookings yet"

**Vehicle Type Icons:** Simple, consistent icon set for Car, Bike, Auto, etc. (inline with text)

## Animations
Minimal, purposeful motion only:
- Card hover: subtle lift (transform scale-102, shadow-lg transition)
- Button clicks: Scale feedback
- Page transitions: Fade in only
- Toast slide-in from top-right