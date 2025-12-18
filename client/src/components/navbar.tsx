import { Link, useLocation } from "wouter";
import { Car, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/trips", label: "Find Rides" },
  { href: "/create-ride", label: "Create Ride" },
  { href: "/my-bookings", label: "My Bookings" },
];

export function Navbar() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-xl hidden sm:inline-block" data-testid="text-logo">
            VITravels
          </span>
        </Link>

        {isAuthenticated && (
          <>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    size="sm"
                    data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user?.name ? getInitials(user.name) : <User className="h-3 w-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium" data-testid="text-user-name">
                        {user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground" data-testid="text-user-email">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={location === link.href ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          data-testid={`link-mobile-${link.label.toLowerCase().replace(" ", "-")}`}
                        >
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
