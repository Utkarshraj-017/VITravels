import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TripCard } from "@/components/trip-card";
import { TripFilter, type FilterValues } from "@/components/trip-filter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Ride, User as UserType } from "@shared/schema";

interface RideWithCreator extends Ride {
  creator: UserType;
}

export default function TripsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterValues>({
    from: "",
    to: "",
    date: "",
    vehicleType: "all",
  });
  const [bookingRideId, setBookingRideId] = useState<string | null>(null);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.date) params.append("date", filters.date);
    if (filters.vehicleType && filters.vehicleType !== "all") {
      params.append("vehicleType", filters.vehicleType);
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  const { data: rides, isLoading } = useQuery<RideWithCreator[]>({
    queryKey: ["/api/rides", filters],
    queryFn: async () => {
      const response = await fetch(`/api/rides${buildQueryString()}`);
      if (!response.ok) throw new Error("Failed to fetch rides");
      return response.json();
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const response = await apiRequest("POST", "/api/bookings", {
        rideId,
        seatsBooked: 1,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my"] });
      toast({
        title: "Booking confirmed!",
        description: "Your seat has been reserved. Contact the driver via WhatsApp.",
      });
      setBookingRideId(null);
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Unable to book this ride. Please try again.",
        variant: "destructive",
      });
      setBookingRideId(null);
    },
  });

  const handleBook = (rideId: string) => {
    setBookingRideId(rideId);
    bookMutation.mutate(rideId);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      from: "",
      to: "",
      date: "",
      vehicleType: "all",
    });
  };

  const hasActiveFilters =
    filters.from || filters.to || filters.date || (filters.vehicleType && filters.vehicleType !== "all");

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">
          Find Rides
        </h1>
        <p className="text-muted-foreground">
          Browse available rides and book your seat
        </p>
      </div>

      <TripFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : rides && rides.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            {rides.length} ride{rides.length !== 1 ? "s" : ""} found
            {hasActiveFilters && " matching your filters"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <TripCard
                key={ride.id}
                ride={ride}
                creator={ride.creator}
                currentUserId={user?.id}
                onBook={handleBook}
                isBooking={bookingRideId === ride.id && bookMutation.isPending}
                showBookButton={true}
              />
            ))}
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {hasActiveFilters ? (
                <Search className="h-8 w-8 text-muted-foreground" />
              ) : (
                <MapPin className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold" data-testid="text-empty-title">
                {hasActiveFilters ? "No matching rides" : "No rides available"}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters to find more rides."
                  : "There are no rides available at the moment. Check back later or create your own!"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
