import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { AddressInput } from "./AddressInput";
import { useAuth } from "@/lib/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CompleteProfileFormProps {
  onSkip?: () => void;
  redirectPath?: string;
  showSkip?: boolean;
  initialValues?: any;
  onSuccess?: () => void;
}

export const CompleteProfileForm = ({
  onSkip,
  redirectPath = "/",
  showSkip = true,
  initialValues,
  onSuccess,
}: CompleteProfileFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, checkProfileCompletion } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialAddress = () => {
    if (initialValues?.addresses && initialValues.addresses.length > 0) {
      const deliveryAddress = initialValues.addresses.find(
        (addr: any) => addr.type === 'DELIVERY'
      );
      return deliveryAddress || null;
    }
    return null;
  };

  const [formData, setFormData] = useState({
    phoneNumber: initialValues?.phone || "",
    address: getInitialAddress() || {
      pincode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
    },
  });

  const handleAddressChange = useCallback((address: any) => {
    setFormData(prev => ({
      ...prev,
      address
    }));
  }, []);

  const completeProfileMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; address: any; isUpdate: boolean }) => {
      const idToken = await user?.getIdToken();
      const url = `http://localhost:3000/api/user/complete-profile`;
      const method = data.isUpdate ? "PATCH" : "POST";
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      };
      
      return axios({
        url,
        method,
        headers,
        data: {
          phoneNumber: data.phoneNumber,
          address: data.address,
        },
      }).then(res => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Profile save error:", error);
      toast({
        title: "Error",
        description: `Failed to save profile. ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => setIsSubmitting(false)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Determine if this is an update or a create operation
    const isUpdate = !!initialValues;

    completeProfileMutation.mutate({
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      isUpdate,
    });
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      navigate(redirectPath);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
          pattern="[0-9]{10}"
          className="w-full"
        />
        <p className="text-xs text-gray-500">Format: 10 digits without spaces or special characters</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Delivery Address
        </label>
        <AddressInput
          type="DELIVERY"
          onAddressChange={handleAddressChange}
          initialAddress={formData.address}
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        {showSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip for now
          </Button>
        )}
        <Button
          type="submit"
          className="bg-skecho-coral hover:bg-skecho-coral-dark text-white ml-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
};
