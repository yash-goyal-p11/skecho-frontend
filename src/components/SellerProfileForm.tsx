import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "./ImageUpload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api";
import { AddressInput } from "./AddressInput";
import { CustomArtPricing } from "./CustomArtPricing";
import axios from "axios"; // Import axios for the API call

interface Category {
  id: string;
  name: string;
}

interface MaterialOption {
  name: string;
  costs: {
    A1: number;
    A2: number;
    A4: number;
  };
}

interface SellerProfileFormProps {
  redirectPath?: string;
  initialValues?:any;
}

export const SellerProfileForm = ({ redirectPath = "/dashboard",initialValues }: SellerProfileFormProps) => {
  const navigate = useNavigate();
  const { user, checkSellerProfileCompletion } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  
  // Add state for file storage
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [portfolioImageFiles, setPortfolioImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState(() => ({
    phoneNumber: initialValues?.phone || "",
    bio: initialValues?.bio || "",
    profileImage: initialValues?.profileImage || "",
    portfolioImages: initialValues?.portfolioImages || [],
    categoryIds: initialValues?.categoryIds?.map((c: any) => c.id) || [],
    pickupAddress: initialValues?.pickupAddress || {
      pincode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India"
    },
    doesCustomArt: initialValues?.doesCustomArt || false,
    customArtPricing: initialValues?.customArtPricing || null,
    materialOptions: initialValues?.materialOptions || null
  }));

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  useEffect(() => {
    if (categoriesData) setCategories(categoriesData);
  }, [categoriesData]);

  const handleProfileImageUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setProfileImageFile(file);
      
      // Create URL for preview
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        profileImage: previewUrl
      }));
    }
  };

  const handleProfileImageRemove = () => {
    if (formData.profileImage) {
      URL.revokeObjectURL(formData.profileImage);
    }
    setProfileImageFile(null);
    setFormData(prev => ({
      ...prev,
      profileImage: ""
    }));
  };

  const handlePortfolioImagesUpload = async (files: File[]) => {
    const newFiles = [...portfolioImageFiles, ...files].slice(0, 5);
    setPortfolioImageFiles(newFiles);
    
    // Create URLs for preview
    const previewUrls = newFiles.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      portfolioImages: previewUrls
    }));
  };

  const handlePortfolioImageRemove = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(formData.portfolioImages[index]);
    
    const newFiles = portfolioImageFiles.filter((_, i) => i !== index);
    setPortfolioImageFiles(newFiles);
    
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index)
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === "other") {
      setShowNewCategoryInput(true);
      return;
    }

    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds
        : [...prev.categoryIds, categoryId]
    }));
  };

  const handleRemoveCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.filter(id => id !== categoryId)
    }));
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch(`http://localhost:3000/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newCategoryData = await response.json();
      setCategories(prev => [...prev, newCategoryData]);
      setFormData(prev => ({
        ...prev,
        categoryIds: [...prev.categoryIds, newCategoryData.id]
      }));
      setNewCategory("");
      setShowNewCategoryInput(false);

      toast({
        title: "Category Added",
        description: "New category has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create new category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePickupAddressChange = (address: any) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: address
    }));
  };

  const handleCustomArtPricingChange = (pricing: {
    doesCustomArt: boolean;
    customArtPricing: {
      A1: { basePrice: number | null; perPersonPrice: number | null };
      A2: { basePrice: number | null; perPersonPrice: number | null };
      A4: { basePrice: number | null; perPersonPrice: number | null };
    } | null;
    materialOptions: MaterialOption[] | null;
  }) => {
    setFormData(prev => ({
      ...prev,
      doesCustomArt: pricing.doesCustomArt,
      customArtPricing: pricing.customArtPricing,
      materialOptions: pricing.materialOptions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.categoryIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Check serviceability of the pickup pincode against a major hub (Delhi)
      const serviceabilityResponse = await axios.post('http://localhost:3000/api/pickup_point/check-serviceability', {
        pickupPincode: formData.pickupAddress.pincode,
        deliveryPincode: '110042', // Pincode for a standard location like Delhi
      });

      if (!serviceabilityResponse.data.isServiceable) {
        setIsSubmitting(false);
        toast({
          title: "Pincode Not Serviceable",
          description: (
            <span>
              Your pickup location is currently not serviceable by our shipping partners. Please choose a different adrress.
            </span>
          ),
          variant: "destructive",
        });
        return;
      }
      
      const idToken = await user?.getIdToken();
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('pickupAddress', JSON.stringify(formData.pickupAddress));
      formDataToSend.append('categoryIds', JSON.stringify(formData.categoryIds));
      formDataToSend.append('doesCustomArt', formData.doesCustomArt.toString());
      if (formData.customArtPricing) {
        formDataToSend.append('customArtPricing', JSON.stringify(formData.customArtPricing));
      }
      if (formData.materialOptions) {
        formDataToSend.append('materialOptions', JSON.stringify(formData.materialOptions));
      }

      // Add profile image if exists
      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile);
      }

      // Add portfolio images if exist
      portfolioImageFiles.forEach(file => {
        formDataToSend.append('portfolioImages', file);
      });

      const response = await fetch(`http://localhost:3000/api/seller/complete-profile`, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${idToken}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Cleanup preview URLs
      if (formData.profileImage) {
        URL.revokeObjectURL(formData.profileImage);
      }
      formData.portfolioImages.forEach(url => URL.revokeObjectURL(url));

      toast({
        title: "Success",
        description: "Your seller profile has been completed successfully.",
      });

      // Set localStorage to indicate seller profile is complete
      localStorage.setItem("seller_profile_complete", "true");
      
      await checkSellerProfileCompletion(user);
      navigate(redirectPath);
    } catch (error) {
      console.error('Error completing seller profile:', error);
      toast({
        title: "Error",
        description: "Failed to complete seller profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
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

      <div className="space-y-4">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={formData.profileImage} />
            <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <ImageUpload
              onUpload={handleProfileImageUpload}
              onRemove={() => handleProfileImageRemove()}
              images={formData.profileImage ? [formData.profileImage] : []}
              maxImages={1}
            />
            <p className="text-sm text-gray-500 mt-2">
              Optional. Maximum size: 5MB
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          required
          placeholder="Tell us about yourself and your art..."
          className="h-32"
        />
      </div>

      <div className="space-y-4">
        <Label>Portfolio Images</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.portfolioImages.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`Portfolio ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handlePortfolioImageRemove(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {formData.portfolioImages.length < 5 && (
          <div>
            <ImageUpload
              onUpload={handlePortfolioImagesUpload}
              onRemove={() => {}}
              images={[]}
              maxImages={5 - formData.portfolioImages.length}
            />
            <p className="text-sm text-gray-500 mt-2">
              Optional. Add up to 5 images to showcase your work. Maximum size per image: 5MB
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.categoryIds.map((categoryId) => {
            const category = categories.find(c => c.id === categoryId);
            return category ? (
              <div
                key={category.id}
                className="bg-skecho-coral/10 text-skecho-coral px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{category.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category.id)}
                  className="text-skecho-coral hover:text-skecho-coral-dark"
                >
                  ×
                </button>
              </div>
            ) : null;
          })}
        </div>
        
        {showNewCategoryInput ? (
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddNewCategory}
              disabled={!newCategory.trim()}
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategory("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Select onValueChange={handleCategorySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
              <SelectItem value="other">+ Add New Category</SelectItem>
            </SelectContent>
          </Select>
        )}
        <p className="text-sm text-gray-500">
          Select at least one category that best describes your art style
        </p>
      </div>

      <div className="space-y-4">
        <Label>Pickup Address</Label>
        <AddressInput
          type="PICKUP"
          onAddressChange={handlePickupAddressChange}
          initialAddress={formData.pickupAddress}
        />
      </div>

      <div className="space-y-4">
        <Label>Custom Art Services</Label>
        <CustomArtPricing
          onPricingChange={handleCustomArtPricingChange}
          initialValues={{
            doesCustomArt: formData.doesCustomArt,
            customArtPricing: formData.customArtPricing,
            materialOptions: formData.materialOptions
          }}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-skecho-coral hover:bg-skecho-coral-dark text-white"
        >
          {isSubmitting ? "Completing..." : "Complete Profile"}
        </Button>
      </div>
    </form>
  );
};
