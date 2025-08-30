import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface AddressInputProps {
  type: "DELIVERY" | "PICKUP";
  onAddressChange: (address: {
    pincode: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
  }) => void;
  initialAddress?: {
    pincode: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
  };
}

export const AddressInput = ({ type, onAddressChange, initialAddress }: AddressInputProps) => {
  const { toast } = useToast();
  const [pincode, setPincode] = useState(initialAddress?.pincode || "");
  const [addressLine1, setAddressLine1] = useState(initialAddress?.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(initialAddress?.addressLine2 || "");
  const [city, setCity] = useState(initialAddress?.city || "");
  const [state, setState] = useState(initialAddress?.state || "");
  const [isLoading, setIsLoading] = useState(false);
  const onAddressChangeRef = useRef(onAddressChange);
  
  // Update ref when prop changes
  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
  }, [onAddressChange]);

  useEffect(() => {
    const fetchPincodeDetails = async () => {
      if (pincode.length === 6) {
        setIsLoading(true);
        try {
          const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = response.data[0];
          
          if (data.Status === "Success") {
            const postOffice = data.PostOffice[0];
            setCity(postOffice.District);
            setState(postOffice.State);
            onAddressChangeRef.current({
              pincode,
              addressLine1,
              addressLine2,
              city: postOffice.District,
              state: postOffice.State,
              country: "India"
            });
          } else {
            toast({
              title: "Invalid Pincode",
              description: "Please enter a valid Indian pincode.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching pincode details:", error);
          toast({
            title: "Error",
            description: "Failed to fetch pincode details. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchPincodeDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [pincode]);

  useEffect(() => {
    onAddressChangeRef.current({
      pincode,
      addressLine1,
      addressLine2,
      city,
      state,
      country: "India",
    });
  }, [pincode, addressLine1, addressLine2, city, state]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode</Label>
        <Input
          id="pincode"
          type="text"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input
          id="addressLine1"
          type="text"
          placeholder="Enter your address"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input
          id="addressLine2"
          type="text"
          placeholder="Apartment, suite, unit, etc. (optional)"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            value={city}
            readOnly
            className="w-full bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            value={state}
            readOnly
            className="w-full bg-gray-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          type="text"
          value="India"
          readOnly
          className="w-full bg-gray-50"
        />
      </div>
    </div>
  );
}; 