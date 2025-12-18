import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  IndianRupee,
  MessageSquare,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertRide } from "@shared/schema";

const createRideSchema = z.object({
  from: z.string().min(2, "From location is required"),
  to: z.string().min(2, "To location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  vehicleType: z.enum(["car", "bike", "auto", "bus"], {
    required_error: "Please select a vehicle type",
  }),
  availableSeats: z.coerce.number().int().min(1, "Must have at least 1 seat"),
  pricePerHead: z.coerce.number().min(0, "Price cannot be negative"),
  whatsappLink: z.string().url("Please enter a valid WhatsApp link"),
  additionalMsg: z.string().optional(),
});

type CreateRideForm = z.infer<typeof createRideSchema>;

const vehicleOptions = [
  { value: "car", label: "Car", seats: "1-4 passengers" },
  { value: "bike", label: "Bike", seats: "1 passenger" },
  { value: "auto", label: "Auto", seats: "1-3 passengers" },
  { value: "bus", label: "Bus", seats: "Multiple passengers" },
];

export default function CreateRidePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<CreateRideForm>({
    resolver: zodResolver(createRideSchema),
    defaultValues: {
      from: "",
      to: "",
      date: "",
      time: "",
      vehicleType: undefined,
      availableSeats: 1,
      pricePerHead: 0,
      whatsappLink: "",
      additionalMsg: "",
    },
  });

  const createRideMutation = useMutation({
    mutationFn: async (data: CreateRideForm) => {
      const response = await apiRequest("POST", "/api/rides", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rides/my"] });
      toast({
        title: "Ride created successfully!",
        description: "Your ride is now visible to other students.",
      });
      setLocation("/trips");
    },
    onError: () => {
      toast({
        title: "Failed to create ride",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateRideForm) => {
    createRideMutation.mutate(data);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">
            Create a Ride
          </h1>
          <p className="text-muted-foreground">
            Share your journey with fellow VIT students
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Journey Details</CardTitle>
          <CardDescription>
            Fill in the details about your trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="VIT Bhopal"
                            className="pl-9"
                            data-testid="input-from"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Bhopal Railway Station"
                            className="pl-9"
                            data-testid="input-to"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            min={getTodayDate()}
                            className="pl-9"
                            data-testid="input-date"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="time"
                            className="pl-9"
                            data-testid="input-time"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle-type">
                          <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.seats}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availableSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Seats</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            className="pl-9"
                            data-testid="input-seats"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>How many seats are available?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerHead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Seat (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            step={10}
                            className="pl-9"
                            data-testid="input-price"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>Set 0 for free rides</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whatsappLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Link</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <SiWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                        <Input
                          placeholder="https://wa.me/91XXXXXXXXXX"
                          className="pl-9"
                          data-testid="input-whatsapp"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Create your link at wa.me/your-number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalMsg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Message (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          placeholder="Any additional details about the ride..."
                          className="pl-9 min-h-[100px] resize-none"
                          data-testid="input-message"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createRideMutation.isPending}
                data-testid="button-create-ride"
              >
                {createRideMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Ride...
                  </>
                ) : (
                  <>
                    <Car className="mr-2 h-4 w-4" />
                    Create Ride
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
