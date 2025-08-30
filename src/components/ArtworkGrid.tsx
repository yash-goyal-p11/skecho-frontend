import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";


interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  isAvailable: boolean;
  seller: {
    id: string;
    user: {
      name: string;
    }
  };
  categories: Array<{
    id: string;
    name: string;
  }>;
}

interface ArtworkGridProps {
  products?: Product[];
  isLoading: boolean;
}

export const ArtworkGrid = ({ products, isLoading }: ArtworkGridProps) => {
  const { addToCart, removeFromCart, isInCart, cart, isLoading: isCartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCartAction = async (artwork: Product) => {
    if (!user) {
      navigate("/signin"); // or "/signup" if that's the correct route
      return;
    }

    const cartItem = cart?.items.find(item => item.product.id === artwork.id);
    if (cartItem) {
      await removeFromCart(cartItem.id);
    } else {
      await addToCart(artwork.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 bg-white/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Skeleton className="h-64 w-full" />
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No artworks found</h3>
        <p className="text-gray-600">Try adjusting your filters to find more artworks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {products.length} artwork{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((artwork) => {
          const cartItem = cart?.items.find(item => item.product.id === artwork.id);
          
          return (
            <Card key={artwork.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
              <div className="relative">
                <div className="h-64 relative overflow-hidden">
                  {artwork.images[0] ? (
                    <img 
                      src={artwork.images[0]} 
                      alt={artwork.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300"></div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <Link to={`/artwork/${artwork.id}`}>
                      <h3 className="text-xl font-semibold hover:text-skecho-coral transition-colors cursor-pointer">
                        {artwork.name}
                      </h3>
                    </Link>
                    <Link to={`/artist/${artwork.seller.id}`}>
                      <p className="text-gray-600 hover:text-skecho-coral transition-colors cursor-pointer">
                        by {artwork.seller.user.name}
                      </p>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {artwork.categories.map(category => (
                        <span key={category.id} className="text-sm bg-skecho-coral/10 text-skecho-coral-dark px-3 py-1 rounded-full">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-skecho-coral">
                      ${artwork.price.toFixed(2)}
                    </span>
                    {artwork.isAvailable ? (
                      <Button 
                        size="sm" 
                        className={`${
                          cartItem 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-skecho-coral hover:bg-skecho-coral-dark'
                        } text-white`}
                        onClick={() => handleCartAction(artwork)}
                        disabled={isCartLoading}
                      >
                        {isCartLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : cartItem ? (
                          'Remove'
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button size="sm" disabled>
                        Sold Out
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
