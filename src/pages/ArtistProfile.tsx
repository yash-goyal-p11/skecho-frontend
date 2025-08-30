import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSeller } from "@/lib/api";
import { Seller } from "@/lib/types";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

type CustomArtRequestFormProps = {
  userId: string | null;
  artistName: string;
  artistEmail: string;
  pricing: any;
  materials: any;
  artistId: string;
};

const CustomArtRequestForm = ({
  userId,
  artistName,
  artistEmail,
  pricing,
  materials,
  artistId,
}: CustomArtRequestFormProps) => {
  const [formData, setFormData] = useState({
    description: "",
    image: null as File | null,
    material: "",
    size: "",
    people: 1,
    remarks: "",
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.size && formData.material && formData.people) {
      const basePrice = pricing[formData.size]?.basePrice || 0;
      const perPersonPrice = pricing[formData.size]?.perPersonPrice || 0;
      const materialCost = materials.find((m: any) => m.name === formData.material)?.costs[formData.size] || 0;
      const calculatedPrice = basePrice + (formData.people > 1 ? (formData.people - 1) * perPersonPrice : 0) + materialCost;
      setTotalPrice(calculatedPrice);
    } else {
      setTotalPrice(0);
    }
  }, [formData.size, formData.material, formData.people, pricing, materials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const idToken = await user?.getIdToken();
      const formDataToSend = new FormData();
      formDataToSend.append("userId", userId || "");
      formDataToSend.append("artistId", artistId);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("paperSize", formData.size);
      formDataToSend.append("paperType", formData.material);
      formDataToSend.append("numPeople", formData.people.toString());
      formDataToSend.append("basePrice", totalPrice.toString());
      if (formData.image) {
        formDataToSend.append("referenceImage", formData.image);
      }
      // Optionally add remarks if you want to store them
      await axios.post(
        "http://localhost:3000/api/custom-orders",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      alert("Custom art request submitted!");
    } catch (error) {
      alert("Failed to submit request. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
    
      

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Project Description</label>
        <Textarea
          id="description"
          placeholder="Please describe your vision for the custom artwork..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="h-32"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="image">Reference Image</label>
        <Input
          id="image"
          type="file"
          onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
        />
      </div>

      <div className="space-y-2">
        <label>Select Options</label>
        <div className="p-4 border rounded-lg space-y-4">
          {Object.keys(pricing).map((size) => (
            <div key={size} className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{size}</p>
                <p className="text-sm text-gray-500">
                  Base: ${pricing[size].basePrice}, Per Extra Person: ${pricing[size].perPersonPrice}
                </p>
              </div>
              <Button
                type="button"
                variant={formData.size === size ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, size })}
              >
                Choose
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label>Material</label>
        <div className="flex gap-2">
          {materials.map((material: any) => (
            <Button
              key={material.name}
              type="button"
              variant={formData.material === material.name ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, material: material.name })}
            >
              {material.name} (+${material.costs[formData.size] || 0})
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="people">Number of People In The Image</label>
        <Input
          id="people"
          type="number"
          min="1"
          value={formData.people}
          onChange={(e) => setFormData({ ...formData, people: parseInt(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="remarks">Remarks</label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
        />
      </div>

      <div className="text-2xl font-bold">
        Total: ${totalPrice.toFixed(2)}
      </div>

      <Button type="submit" className="w-full bg-skecho-coral hover:bg-skecho-coral-dark text-white" disabled={isSubmitting}>
        Submit Request
      </Button>
    </form>
  );
};

const ArtistProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [userDbId, setUserDbId] = useState<string | null>(null);
  const { data: seller, isLoading, error } = useQuery<Seller>({
    queryKey: ['seller', id],
    queryFn: () => fetchSeller(id!),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!id
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      const idToken = await user.getIdToken();
      const res = await axios.get("http://localhost:3000/api/user/profile", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setUserDbId(res.data.id);
    };
    fetchUserProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="md:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <div>
                <Skeleton className="h-24 w-full" />
              </div>
              <div>
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Artist not found</h1>
          <Link to="/browse" className="text-skecho-coral hover:text-skecho-coral-dark mt-4 inline-block">
            Return to Browse
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Artist Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Artist Photo/Avatar */}
          <div className="relative">
            <div className="aspect-square w-full bg-gradient-to-br from-skecho-coral to-skecho-coral-dark rounded-lg shadow-xl flex items-center justify-center overflow-hidden">
              <img 
                src={seller.profileImage ?? "/assets/pfp.jpg"} 
                alt={`${seller.user?.name ?? "Artist"}'s profile`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Artist Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{seller.user?.name ?? "Artist"}</h1>
              <p className="text-gray-600">Member since {seller.user?.createdAt ? new Date(seller.user.createdAt).toLocaleDateString() : "Unknown"}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set((seller.products ?? []).flatMap(p => p.categories.map(c => c.name)))).map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-skecho-coral/10 text-skecho-coral-dark rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-skecho-coral hover:bg-skecho-coral-dark text-white" disabled={!seller.doesCustomArt}>
                  Request Custom Artwork
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Request Custom Artwork</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to request a custom piece from {seller.user?.name ?? "Artist"}.
                  </DialogDescription>
                </DialogHeader>
                <CustomArtRequestForm
                  userId={userDbId}
                  artistName={seller.user?.name ?? ""}
                  artistEmail={seller.user?.email ?? ""}
                  pricing={seller.customArtPricing ?? {}}
                  materials={seller.materialOptions ?? []}
                  artistId={seller.userId}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Artist Portfolio */}
        {seller.portfolioImages && seller.portfolioImages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(seller.portfolioImages ?? []).map((image, index) => (
                <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Portfolio image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artist's Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Artwork for Sale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(seller.products ?? []).map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
                <Link to={`/artwork/${product.id}`}>
                  <div className="relative">
                    <div className="h-64 relative overflow-hidden">
                      {product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300"></div>
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                        product.isAvailable 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Sold'}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-skecho-coral transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-2xl font-bold text-skecho-coral mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ArtistProfile; 