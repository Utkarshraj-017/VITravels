import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import type { Ride } from "@shared/schema";

const editRideSchema = z.object({
  from: z.string().min(2, "From location is required"),
  to: z.string().min(2, "To location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  vehicleType: z.enum(["car", "bike", "auto", "bus"]),
  availableSeats: z.number().int().min(0, "Seats cannot be negative"),
  pricePerHead: z.number().min(0, "Price cannot be negative"),
  whatsappLink: z.string().min(1, "WhatsApp link is required"),
  additionalMsg: z.string().optional(),
  status: z.enum(["OPEN", "FULL", "CANCELLED"]),
});

type EditRideFormData = z.infer<typeof editRideSchema>;

interface EditRideDialogProps {
  ride: Ride | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRideDialog({ ride, open, onOpenChange }: EditRideDialogProps) {
  const { toast } = useToast();

  const form = useForm<EditRideFormData>({
    resolver: zodResolver(editRideSchema),
    defaultValues: {
      from: ride?.from || "",
      to: ride?.to || "",
      date: ride?.date || "",
      time: ride?.time || "",
      vehicleType: ride?.vehicleType || "car",
      availableSeats: ride?.availableSeats || 1,
      pricePerHead: ride?.pricePerHead || 0,
      whatsappLink: ride?.whatsappLink || "",
      additionalMsg: ride?.additionalMsg || "",
      status: ride?.status || "OPEN",
    },
  });

  useState(() => {
    if (ride) {
      form.reset({
        from: ride.from,
        to: ride.to,
        date: ride.date,
        time: ride.time,
        vehicleType: ride.vehicleType,
        availableSeats: ride.availableSeats,
        pricePerHead: ride.pricePerHead,
        whatsappLink: ride.whatsappLink,
        additionalMsg: ride.additionalMsg || "",
        status: ride.status,
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditRideFormData) => {
      return apiRequest("PATCH", `/api/rides/${ride?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Ride updated",
        description: "Your ride has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rides/my"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update ride",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditRideFormData) => {
    updateMutation.mutate(data);
  };

  if (!ride) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ride</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input placeholder="Starting point" {...field} data-testid="input-edit-from" />
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
                      <Input placeholder="Destination" {...field} data-testid="input-edit-to" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-edit-date" />
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
                      <Input type="time" {...field} data-testid="input-edit-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-vehicle">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="FULL">Full</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="availableSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Seats</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-edit-seats"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerHead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Seat</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-edit-price"
                      />
                    </FormControl>
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
                    <Input placeholder="https://wa.me/..." {...field} data-testid="input-edit-whatsapp" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalMsg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details..."
                      className="resize-none"
                      {...field}
                      data-testid="input-edit-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
