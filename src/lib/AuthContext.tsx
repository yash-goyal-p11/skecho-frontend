import { createContext, useContext, useEffect, useState } from "react";
import { User, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, checkSellerProfileCompletion as checkSellerProfileCompletionAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  returnPath: string | null;
  setReturnPath: (path: string | null) => void;
  isProfileComplete: boolean;
  setIsProfileComplete: (value: boolean) => void;
  isSellerProfileComplete: boolean;
  setIsSellerProfileComplete: (value: boolean) => void;
  checkProfileCompletion: (user: User | null) => Promise<boolean>;
  checkSellerProfileCompletion: (user: User | null) => Promise<boolean>;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnPath, setReturnPath] = useState<string | null>(null);

  const [isProfileComplete, setIsProfileComplete] = useState(()=>{
    const stored = localStorage.getItem(`profile_complete`);
    return stored === "true";
  });

  const [isSellerProfileComplete, setIsSellerProfileComplete] = useState(() => {
    const stored = localStorage.getItem("seller_profile_complete");
    return stored === "true";
  });
  const [error, setError] = useState<Error | null>(null);

 
  const checkProfileCompletion = async (user: User | null) => {
    if (!user) return false;
    try {
      const idToken = await user.getIdToken();
      const res = await fetchUserProfile(idToken);
      setIsProfileComplete(!!res.profileCompleted);
      return !!res.profileCompleted;
    } catch (error) {
      setIsProfileComplete(false);
      return false;
    }
  };

  // Check if seller profile is complete
  const checkSellerProfileCompletion = async (user: User | null) => {
    const currentUser = user || user;
    if (!currentUser) return false;
    try {
      const idToken = await currentUser.getIdToken();
      const response = await checkSellerProfileCompletionAPI(idToken);
      setIsSellerProfileComplete(!!response.isComplete);
      return !!response.isComplete;
    } catch (error) {
      console.error("Error checking seller profile completion:", error);
      // Fallback to localStorage if API fails
      const isComplete = localStorage.getItem("seller_profile_complete") === "true";
      setIsSellerProfileComplete(isComplete);
      return isComplete;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("onauthstatechanged called with user",user);
      
      setLoading(true);
      setUser(user);
      if (user) {
        console.log("useeffect is called and user is",user);
        await Promise.all([
          checkProfileCompletion(user),
          checkSellerProfileCompletion(user)
        ]);
        console.log("both promises done");
        
      } else {
        setIsProfileComplete(false);
        setIsSellerProfileComplete(false);
        // Clear any stored profile completion status
        localStorage.removeItem(`profile_complete`);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsProfileComplete(false);
      setIsSellerProfileComplete(false);
      // Clear any stored profile completion status
      localStorage.removeItem("profile_complete");
      localStorage.removeItem("seller_profile_complete");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        returnPath, 
        setReturnPath, 
        isProfileComplete, 
        setIsProfileComplete,
        isSellerProfileComplete,
        setIsSellerProfileComplete,
        checkProfileCompletion,
        checkSellerProfileCompletion,
        error,
        signIn: async (email: string, password: string) => {
          // Implementation of signIn
        },
        signUp: async (email: string, password: string, name: string) => {
          // Implementation of signUp
        },
        signOut
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useRequireAuth = (requireComplete = false) => {
  const { user, isProfileComplete, setReturnPath } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (path: string) => {
    if (!user) {
      setReturnPath(path);
      navigate("/signin");
      return false;
    }

    if (requireComplete && !isProfileComplete) {
      navigate("/complete-profile", { state: { from: path } });
      return false;
    }

    return true;
  };

  return requireAuth;
};

export const useRequireSellerProfile = () => {
  const { user, isSellerProfileComplete, loading } = useAuth();
  const navigate = useNavigate();

  const requireSellerProfile = (path: string) => {
    if (loading) {
      return null;
    }

    if (!user) {
      navigate("/signin");
      return false;
    }

    if (!isSellerProfileComplete) {
      navigate("/complete-seller-profile", { state: { from: path } });
      return false;
    }

    return true;
  };

  return requireSellerProfile;
}; 