import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Signin from "./pages/Signin";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import ArtistProfile from "./pages/ArtistProfile";
import CompleteProfile from "./pages/CompleteProfile";
import CompleteSellerProfile from "./pages/CompleteSellerProfile";
import SellerDashboard from "./pages/SellerDashboard";
import AddProduct from "./pages/AddProduct";
import Cart from "./pages/Cart";
import Artists from "./pages/Artists";
import EditProduct from "./pages/EditProduct";
import { AuthProvider } from "./lib/AuthContext";
import { CartProvider } from "./lib/CartContext";
import EditProfile from "./pages/EditProfile";
import MyOrders from "./pages/MyOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/artwork/:id" element={<ProductDetail />} />
              <Route path="/artist/:id" element={<ArtistProfile />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/complete-seller-profile" element={<CompleteSellerProfile />} />
              <Route path="/dashboard" element={<SellerDashboard />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/edit-product/:id" element={<EditProduct />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/my-orders" element={<MyOrders />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
