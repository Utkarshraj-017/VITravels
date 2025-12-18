import { useState } from "react";
import { Search, Filter, X, Calendar, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface FilterValues {
  from: string;
  to: string;
  date: string;
  vehicleType: string;
}

interface TripFilterProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onClear: () => void;
}

const vehicleTypes = [
  { value: "all", label: "All Vehicles" },
  { value: "car", label: "Car" },
  { value: "bike", label: "Bike" },
  { value: "auto", label: "Auto" },
  { value: "bus", label: "Bus" },
];

export function TripFilter({ filters, onFilterChange, onClear }: TripFilterProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const hasActiveFilters =
    filters.from || filters.to || filters.date || (filters.vehicleType && filters.vehicleType !== "all");

  const activeFilterCount = [
    filters.from,
    filters.to,
    filters.date,
    filters.vehicleType && filters.vehicleType !== "all",
  ].filter(Boolean).length;

  const handleLocalChange = (key: keyof FilterValues, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setMobileOpen(false);
  };

  const handleDesktopChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = { from: "", to: "", date: "", vehicleType: "all" };
    setLocalFilters(clearedFilters);
    onClear();
  };

  return (
    <>
      <Card className="hidden md:block p-4 sticky top-20 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="filter-from" className="text-xs text-muted-foreground mb-1.5 block">
              From
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="filter-from"
                placeholder="Departure city"
                value={filters.from}
                onChange={(e) => handleDesktopChange("from", e.target.value)}
                className="pl-9"
                data-testid="input-filter-from"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="filter-to" className="text-xs text-muted-foreground mb-1.5 block">
              To
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="filter-to"
                placeholder="Destination city"
                value={filters.to}
                onChange={(e) => handleDesktopChange("to", e.target.value)}
                className="pl-9"
                data-testid="input-filter-to"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[160px]">
            <Label htmlFor="filter-date" className="text-xs text-muted-foreground mb-1.5 block">
              Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="filter-date"
                type="date"
                value={filters.date}
                onChange={(e) => handleDesktopChange("date", e.target.value)}
                className="pl-9"
                data-testid="input-filter-date"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Vehicle Type</Label>
            <Select
              value={filters.vehicleType || "all"}
              onValueChange={(value) => handleDesktopChange("vehicleType", value)}
            >
              <SelectTrigger data-testid="select-filter-vehicle">
                <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground"
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </Card>

      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full" data-testid="button-open-filters">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filter Rides
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="mobile-from">From</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile-from"
                    placeholder="Departure city"
                    value={localFilters.from}
                    onChange={(e) => handleLocalChange("from", e.target.value)}
                    className="pl-9"
                    data-testid="input-mobile-filter-from"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-to">To</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile-to"
                    placeholder="Destination city"
                    value={localFilters.to}
                    onChange={(e) => handleLocalChange("to", e.target.value)}
                    className="pl-9"
                    data-testid="input-mobile-filter-to"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile-date"
                    type="date"
                    value={localFilters.date}
                    onChange={(e) => handleLocalChange("date", e.target.value)}
                    className="pl-9"
                    data-testid="input-mobile-filter-date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <Select
                  value={localFilters.vehicleType || "all"}
                  onValueChange={(value) => handleLocalChange("vehicleType", value)}
                >
                  <SelectTrigger data-testid="select-mobile-filter-vehicle">
                    <SelectValue placeholder="All Vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="flex flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
                data-testid="button-mobile-clear-filters"
              >
                Clear All
              </Button>
              <Button onClick={applyFilters} className="flex-1" data-testid="button-apply-filters">
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
