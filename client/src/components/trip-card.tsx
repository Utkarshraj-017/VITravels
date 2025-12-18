import { format } from "date-fns";
import { Car, Bike, Bus, MapPin, Calendar, Clock, Users, IndianRupee } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Ride, User } from "@shared/schema";

interface TripCardProps {
  ride: Ride;
  creator?: User;
  onBook?: (rideId: string) => void;
  isBooking?: boolean;
  showBookButton?: boolean;
  currentUserId?: string;
}

const vehicleIcons = {
  car: Car,
  bike: Bike,
  auto: Car,
  bus: Bus,
};

const vehicleLabels = {
  car: "Car",
  bike: "Bike",
  auto: "Auto",
  bus: "Bus",
};

export function TripCard({
  ride,
  creator,
  onBook,
  isBooking = false,
  showBookButton = true,
  currentUserId,
}: TripCardProps) {
  const VehicleIcon = vehicleIcons[ride.vehicleType];
  const isCreator = currentUserId === ride.creatorId;
  const canBook = !isCreator && ride.status === "OPEN" && showBookButton;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEE, MMM d");
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      className="group relative overflow-visible transition-all duration-200 hover-elevate"
      data-testid={`card-ride-${ride.id}`}
    >
      <Badge
        variant={ride.status === "OPEN" ? "default" : "secondary"}
        className="absolute -top-2 right-4 z-10"
        data-testid={`badge-status-${ride.id}`}
      >
        {ride.status}
      </Badge>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary" />
            <div className="w-0.5 h-8 bg-border" />
            <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
                <p
                  className="font-semibold text-lg truncate"
                  data-testid={`text-from-${ride.id}`}
                >
                  {ride.from}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">To</p>
                <p
                  className="font-semibold text-lg truncate"
                  data-testid={`text-to-${ride.id}`}
                >
                  {ride.to}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-date-${ride.id}`}>{formatDate(ride.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-time-${ride.id}`}>{ride.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <VehicleIcon className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-vehicle-${ride.id}`}>
              {vehicleLabels[ride.vehicleType]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-seats-${ride.id}`}>
              {ride.availableSeats} seat{ride.availableSeats !== 1 ? "s" : ""} left
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <IndianRupee className="h-5 w-5 text-primary" />
            <span
              className="text-2xl font-bold text-primary"
              data-testid={`text-price-${ride.id}`}
            >
              {ride.pricePerHead}
            </span>
            <span className="text-sm text-muted-foreground">/seat</span>
          </div>
        </div>

        {ride.additionalMsg && (
          <p
            className="text-sm text-muted-foreground line-clamp-2"
            data-testid={`text-message-${ride.id}`}
          >
            {ride.additionalMsg}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={creator?.avatar} alt={creator?.name} />
            <AvatarFallback className="bg-muted text-xs">
              {creator?.name ? getInitials(creator.name) : "??"}
            </AvatarFallback>
          </Avatar>
          <span
            className="text-sm font-medium truncate max-w-[120px]"
            data-testid={`text-creator-${ride.id}`}
          >
            {isCreator ? "You" : creator?.name || "Unknown"}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid={`button-whatsapp-${ride.id}`}
          >
            <a
              href={ride.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <SiWhatsapp className="h-4 w-4 text-green-600" />
              <span className="hidden sm:inline">Chat</span>
            </a>
          </Button>

          {canBook && (
            <Button
              size="sm"
              onClick={() => onBook?.(ride.id)}
              disabled={isBooking}
              data-testid={`button-book-${ride.id}`}
            >
              {isBooking ? "Booking..." : "Book Now"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
