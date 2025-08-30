import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArtworkGrid } from "@/components/ArtworkGrid";
import { ArtworkFilters } from "@/components/ArtworkFilters";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";


const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "1000")
  ]);
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  const [availability, setAvailability] = useState<boolean>(searchParams.get("available") === "true");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (priceRange[0] !== 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] !== 1000) params.set("maxPrice", priceRange[1].toString());
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (availability) params.set("available", "true");
    setSearchParams(params);
  }, [selectedCategory, priceRange, sortBy, availability, setSearchParams]);

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, priceRange, sortBy, availability],
    queryFn: () => fetchProducts({
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      minPrice: priceRange[0] !== 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] !== 1000 ? priceRange[1] : undefined,
      isAvailable: availability ? true : undefined,
      orderBy: sortBy === "price-low" || sortBy === "price-high" ? "price" : "createdAt",
      order: sortBy === "oldest" ? "asc" : sortBy === "price-low" ? "asc" : "desc"
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleReset = () => {
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
    setSortBy("newest");
    setAvailability(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-skecho-charcoal">Browse Artworks</h1>
          <div className="text-xl text-gray-600">
            {isLoading ? (
              <Skeleton className="h-8 w-96" />
            ) : (
              `Discover ${productsData?.total || 0} unique pieces from talented independent artists`
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ArtworkFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              availability={availability}
              onAvailabilityChange={setAvailability}
              onReset={handleReset}
            />
          </div>
          
          <div className="lg:col-span-3">
            <ArtworkGrid
              products={productsData?.products}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Browse;
