import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";


export const FeaturedArtworks = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => fetchProducts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Add debugging logs
  console.log('Component state:', { products: data?.products, isLoading, error });

  if (error) {
    console.error('Error loading featured products:', error);
    return (
      <div className="py-16 text-center text-gray-600">
        Failed to load featured artworks. Please try again later.
      </div>
    );
  }

  // Add null check for products
  if (!isLoading && (!data?.products || data.products.length === 0)) {
    return (
      <div className="py-16 text-center text-gray-600">
        No artworks available at the moment.
      </div>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Artworks</h2>
          <p className="text-xl text-gray-600">
            Discover our latest and most exceptional pieces
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="w-full h-64" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.products.slice(0, 6).map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <Link to={`/artwork/${product.id}`}>
                    <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-4">by {product.seller.user.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                        <div className="space-x-2">
                          <Button size="icon" variant="ghost">
                            <Heart className="w-5 h-5" />
                          </Button>
                          <Button size="icon">
                            <ShoppingCart className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/browse">
            <Button size="lg" variant="outline" className="border-skecho-coral text-skecho-coral-dark hover:bg-skecho-coral-light/30">
              View All Artworks
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
