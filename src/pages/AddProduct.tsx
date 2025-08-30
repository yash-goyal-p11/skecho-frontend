import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AddProductForm } from "@/components/AddProductForm";
import { useAuth } from "@/lib/AuthContext";
import { Navigate } from "react-router-dom";

const AddProduct = () => {
  const { user, isSellerProfileComplete } = useAuth();

  // If user is not logged in, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If seller profile is not complete, redirect to complete seller profile
  if (!isSellerProfileComplete) {
    return <Navigate to="/complete-seller-profile" state={{ from: "/add-product" }} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Artwork</h1>
            <p className="text-gray-600">
              Share your creation with the world. Please provide detailed information about your artwork.
            </p>
          </div>

          <AddProductForm />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AddProduct; 