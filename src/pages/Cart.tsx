import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
    seller: {
      user: {
        name: string;
      }
    }
  }
}

const Cart = () => {
  const { cart, isLoading, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-8">You need to be signed in to view your cart.</p>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
                <div className="flex gap-6">
                  <Skeleton className="h-32 w-32 rounded-lg" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Browse our collection to find amazing artworks!</p>
          <Link to="/browse">
            <Button>Browse Artworks</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number, maxQuantity: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      try {
        await updateQuantity(itemId, newQuantity);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to update quantity",
          variant: "destructive",
        });
      }
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout logic
    console.log('Proceeding to checkout...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <Link to={`/artwork/${item.product.id}`} className="shrink-0">
                    <div className="h-32 w-32 mx-auto sm:mx-0 rounded-lg overflow-hidden">
                      {item.product.images[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/artwork/${item.product.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-skecho-coral transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <Link to={`/artist/${item.product.seller.user.name}`}>
                        <p className="text-gray-600 hover:text-skecho-coral transition-colors">
                          by {item.product.seller.user.name}
                        </p>
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeFromCart(item.id);
                              } else {
                                handleQuantityChange(item.id, item.quantity, -1, item.product.quantity);
                              }
                            }}
                            disabled={false}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="icon" 
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.product.quantity)}
                            disabled={item.quantity >= item.product.quantity}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="text-sm text-gray-500">
                          {item.quantity >= item.product.quantity
                            ? `not more than ${item.product.quantity} available`
                            : `${item.product.quantity} available`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button 
                  className="w-full bg-skecho-coral hover:bg-skecho-coral-dark text-white mt-4"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart; 