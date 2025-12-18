import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  X,
  Loader2,
  Car,
  Bike,
  Bus,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Booking, Ride, User as UserType } from "@shared/schema";

interface BookingWithRide extends Booking {
  ride: Ride & { creator: UserType };
}

const vehicleIcons = {
  car: Car,
  bike: Bike,
  auto: Car,
  bus: Bus,
};

export default function MyBookingsPage() {
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: bookings, isLoading } = useQuery<BookingWithRide[]>({
    queryKey: ["/api/bookings/my"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiRequest("DELETE", `/api/bookings/${bookingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled and the seat is now available.",
      });
      setCancellingId(null);
    },
    onError: () => {
      toast({
        title: "Cancellation failed",
        description: "Unable to cancel booking. Please try again.",
        variant: "destructive",
      });
      setCancellingId(null);
    },
  });

  const handleCancel = (bookingId: string) => {
    setCancellingId(bookingId);
    cancelMutation.mutate(bookingId);
  };

  const activeBookings = bookings?.filter((b) => b.status === "BOOKED") || [];
  const pastBookings = bookings?.filter((b) => b.status === "CANCELLED") || [];

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEE, MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatBookedAt = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateStr;
    }
  };

  const BookingCard = ({ booking }: { booking: BookingWithRide }) => {
    const ride = booking.ride;
    const VehicleIcon = vehicleIcons[ride.vehicleType];
    const isActive = booking.status === "BOOKED";

    return (
      <Card
        className={`overflow-visible ${!isActive ? "opacity-70" : ""}`}
        data-testid={`card-booking-${booking.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <VehicleIcon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{ride.from}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">{ride.to}</span>
            </div>
            <Badge
              variant={isActive ? "default" : "secondary"}
              data-testid={`badge-booking-status-${booking.id}`}
            >
              {booking.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span data-testid={`text-booking-date-${booking.id}`}>
                {formatDate(ride.date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span data-testid={`text-booking-time-${booking.id}`}>{ride.time}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4 text-primary" />
                <span
                  className="text-xl font-bold text-primary"
                  data-testid={`text-booking-price-${booking.id}`}
                >
                  {booking.totalPrice}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Seats</p>
              <span
                className="text-lg font-semibold"
                data-testid={`text-booking-seats-${booking.id}`}
              >
                {booking.seatsBooked}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Booked on {formatBookedAt(booking.bookedAt)}
            {booking.cancelledAt && (
              <span className="block mt-1">
                Cancelled on {formatBookedAt(booking.cancelledAt)}
              </span>
            )}
          </div>

          {isActive && (
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a
                  href={ride.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`button-booking-whatsapp-${booking.id}`}
                >
                  <SiWhatsapp className="h-4 w-4 mr-2 text-green-600" />
                  Contact Driver
                </a>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={cancellingId === booking.id && cancelMutation.isPending}
                    data-testid={`button-cancel-booking-${booking.id}`}
                  >
                    {cancellingId === booking.id && cancelMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this booking? The seat will become
                      available for other students.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancel(booking.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: "active" | "past" }) => (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Ticket className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {type === "active" ? "No active bookings" : "No past bookings"}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {type === "active"
              ? "You haven't booked any rides yet. Browse available rides to get started!"
              : "Your cancelled bookings will appear here."}
          </p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">
          My Bookings
        </h1>
        <p className="text-muted-foreground">
          View and manage your ride bookings
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" data-testid="tab-active-bookings">
            Active ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past-bookings">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : activeBookings.length > 0 ? (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState type="active" />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState type="past" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
