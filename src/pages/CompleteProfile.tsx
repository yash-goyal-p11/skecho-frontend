import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CompleteProfileForm } from "@/components/CompleteProfileForm";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import axios from "axios"
const CompleteProfile = () => {
  const location = useLocation();
  const { user } = useAuth();
  const redirectPath = location.state?.from || "/";

  // If user is not logged in, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">
              Please provide your contact details to enable purchases and deliveries.
            </p>
          </div>

          <CompleteProfileForm redirectPath={redirectPath} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompleteProfile; 