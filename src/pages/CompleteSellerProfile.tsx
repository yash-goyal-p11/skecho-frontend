import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SellerProfileForm } from "@/components/SellerProfileForm";
import { useAuth } from "@/lib/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const CompleteSellerProfile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const redirectPath = location.state?.from || "/dashboard";

  // If user is not logged in, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Seller Profile</h1>
            <p className="text-gray-600">
              Set up your artist profile to start selling your artwork.
            </p>
          </div>

          <SellerProfileForm redirectPath={redirectPath} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompleteSellerProfile; 