import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ArtworkFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  availability: boolean;
  onAvailabilityChange: (available: boolean) => void;
  onReset: () => void;
}



export const ArtworkFilters = ({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  availability,
  onAvailabilityChange,
  onReset
}: ArtworkFiltersProps) => {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          {selectedCategory !== "all" && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onCategoryChange("all")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              selectedCategory === "all" && "bg-gradient-to-r from-purple-600 to-blue-600"
            )}
            onClick={() => onCategoryChange("all")}
          >
            All Categories
          </Button>
          {categories?.map((category: { id: string; name: string }) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name.toLowerCase() ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                selectedCategory === category.name.toLowerCase() && "bg-gradient-to-r from-purple-600 to-blue-600"
              )}
              onClick={() => onCategoryChange(category.name.toLowerCase())}
            >
              {category.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Price Range</CardTitle>
          {(priceRange[0] !== 0 || priceRange[1] !== 1000) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onPriceRangeChange([0, 1000])}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sort By */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="availability"
              checked={availability}
              onCheckedChange={onAvailabilityChange}
            />
            <Label htmlFor="availability">Show only available items</Label>
          </div>
        </CardContent>
      </Card>

      {/* Reset Filters */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onReset}
      >
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
