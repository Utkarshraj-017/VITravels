import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Car, Ticket, Users, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TripCard } from "@/components/trip-card";
import { EditRideDialog } from "@/components/edit-ride-dialog";
import { DeleteRideDialog } from "@/components/delete-ride-dialog";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Ride, User as UserType, Booking } from "@shared/schema";

interface RideWithCreator extends Ride {
  creator: UserType;
}

interface DashboardStats {
  activeRides: number;
  myBookings: number;
  seatsShared: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [deletingRideId, setDeletingRideId] = useState<string | null>(null);

  const { data: rides, isLoading: ridesLoading } = useQuery<RideWithCreator[]>({
    queryKey: ["/api/rides"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/my"],
  });

  const { data: myRides, isLoading: myRidesLoading } = useQuery<Ride[]>({
    queryKey: ["/api/rides/my"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (rideId: string) => {
      return apiRequest("DELETE", `/api/rides/${rideId}`);
    },
    onSuccess: () => {
      toast({
        title: "Ride deleted",
        description: "Your ride has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rides/my"] });
      setDeletingRideId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete ride",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (ride: Ride) => {
    setEditingRide(ride);
  };

  const handleDelete = (rideId: string) => {
    setDeletingRideId(rideId);
  };

  const confirmDelete = () => {
    if (deletingRideId) {
      deleteMutation.mutate(deletingRideId);
    }
  };

  const stats: DashboardStats = {
    activeRides: rides?.filter((r) => r.status === "OPEN").length || 0,
    myBookings: bookings?.filter((b) => b.status === "BOOKED").length || 0,
    seatsShared: myRides?.reduce((acc, r) => acc + (r.totalSeats - r.availableSeats), 0) || 0,
  };

  const recentRides = rides?.slice(0, 6) || [];

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              data-testid="text-welcome"
            >
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Find a ride or offer one to fellow students
            </p>
          </div>
          <Link href="/create-ride">
            <Button size="lg" data-testid="button-create-ride-cta">
              <Plus className="mr-2 h-5 w-5" />
              Create Ride
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card data-testid="card-stat-active-rides">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Rides
              </CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-stat-active-rides">
                {stats.activeRides}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Available to book</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-bookings">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Bookings
              </CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-stat-bookings">
                {stats.myBookings}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active bookings</p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-seats">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Seats Shared
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-stat-seats">
                {stats.seatsShared}
              </div>
              <p className="text-xs text-muted-foreground mt-1">From your rides</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Recent Rides</h2>
          <Link href="/trips">
            <Button variant="ghost" size="sm" data-testid="link-view-all-rides">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {ridesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-24 w-full" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRides.map((ride) => (
              <TripCard
                key={ride.id}
                ride={ride}
                creator={ride.creator}
                currentUserId={user?.id}
                showBookButton={false}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No rides available</h3>
                <p className="text-muted-foreground max-w-sm">
                  Be the first to create a ride and help fellow students travel together!
                </p>
              </div>
              <Link href="/create-ride">
                <Button data-testid="button-create-first-ride">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Ride
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
