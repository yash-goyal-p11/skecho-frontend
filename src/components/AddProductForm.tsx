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
import { ImageUpload } from "./ImageUpload";
import { fetchCategories, createProduct, updateProduct, updateProductAvailability, createCategory } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Category {
  id: string;
  name: string;
}

interface AddProductFormProps {
  initialData?: any;
  isEdit?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AddProductForm = ({ initialData, isEdit, onClose, onSuccess }: AddProductFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    categoryIds: initialData?.categories?.map((c: any) => c.id) || [],
    images: initialData?.images || [],
    quantity: initialData?.quantity || 1,
  });

  const [isAvailable, setIsAvailable] = useState(initialData?.isAvailable ?? true);
  useEffect(() => {
    if (typeof initialData?.isAvailable === 'boolean') setIsAvailable(initialData.isAvailable);
  }, [initialData]);

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  useEffect(() => {
    if (categoriesData) setCategories(categoriesData);
  }, [categoriesData]);

  // If initialData changes (e.g. when editing a different product), update formData
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",
        categoryIds: initialData.categories?.map((c: any) => c.id) || [],
        images: initialData.images || [],
        quantity: initialData.quantity || 1,
      });
    }
  }, [initialData]);

  const handleImageUpload = (files: File[]) => {
    setImageFiles(prev => [...prev, ...files]);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...previewUrls]
    }));
  };

  const handleImageRemove = (index: number) => {
    URL.revokeObjectURL(formData.images[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
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

  const queryClient = useQueryClient();

  // Category creation mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const idToken = await user?.getIdToken();
      return createCategory(idToken, { name });
    },
    onSuccess: (newCategoryData) => {
      setCategories(prev => [...prev, newCategoryData]);
      setFormData(prev => ({
        ...prev,
        categoryIds: [...prev.categoryIds, newCategoryData.id]
      }));
      setNewCategory("");
      setShowNewCategoryInput(false);
      toast({ title: "Category Added" });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      toast({ title: "Failed to add category", variant: "destructive" });
    }
  });

  // Product create mutation
  const createProductMutation = useMutation({
    mutationFn: async (formDataToSend: FormData) => {
      const idToken = await user?.getIdToken();
      return createProduct(idToken, formDataToSend);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Your artwork has been listed successfully." });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      if (!isEdit) navigate("/dashboard");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create product. Please try again.", variant: "destructive" });
    },
    onSettled: () => setIsSubmitting(false)
  });

  // Product update mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, formDataToSend }: { productId: string, formDataToSend: FormData }) => {
      const idToken = await user?.getIdToken();
      return updateProduct(idToken, productId, formDataToSend);
    },
    onSuccess: () => {
      toast({ title: "Product updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update product. Please try again.", variant: "destructive" });
    },
    onSettled: () => setIsSubmitting(false)
  });

  // Product availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const idToken = await user?.getIdToken();
      return updateProductAvailability(idToken, initialData.id, isAvailable);
    },
    onSuccess: () => {
      setIsAvailable((prev) => !prev);
      toast({ title: !isAvailable ? 'Product marked as available.' : 'Product marked as sold.' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({ title: 'Failed to update availability.', variant: 'destructive' });
    },
    onSettled: () => setIsSubmitting(false)
  });

  const handleAddNewCategory = async () => {
    createCategoryMutation.mutate(newCategory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('categoryIds', JSON.stringify(formData.categoryIds));
    formDataToSend.append('quantity', formData.quantity.toString());
    
    // Add main image (first image)
    if (imageFiles.length > 0) {
      formDataToSend.append('mainImage', imageFiles[0]);
    }

    // Add additional images
    if (imageFiles.length > 1) {
      imageFiles.slice(1).forEach(file => {
        formDataToSend.append('additionalImages', file);
      });
    }

    if (isEdit && initialData?.id) {
      updateProductMutation.mutate({ productId: initialData.id, formDataToSend });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
    // Cleanup preview URLs
    formData.images.forEach(url => URL.revokeObjectURL(url));
  };

  // Handler for Mark as Sold/Available
  const handleToggleAvailability = async () => {
    if (!initialData?.id) return;
    setIsSubmitting(true);
    updateAvailabilityMutation.mutate(!isAvailable);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isEdit && typeof isAvailable === 'boolean' && (
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            variant={isAvailable ? 'destructive' : 'default'}
            onClick={handleToggleAvailability}
            disabled={isSubmitting}
            className={isAvailable ? '' : 'bg-green-600 hover:bg-green-700 text-white'}
          >
            {isAvailable ? 'Mark as Sold' : 'Mark as Available'}
          </Button>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Artwork Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter the name of your artwork"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Describe your artwork, its inspiration, and any other relevant details"
          className="h-32"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (USD)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="1"
          value={formData.price}
          onChange={(e) => {
            const value = e.target.value;
            // Only update if it's a valid number or empty string
            if (value === '' || !isNaN(Number(value))) {
              setFormData({ ...formData, price: value });
            }
          }}
          required
          placeholder="Enter the price"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Available Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          step="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
          required
          placeholder="Enter available quantity"
        />
        <p className="text-sm text-gray-500">Minimum quantity is 1</p>
      </div>

      <div className="space-y-4">
        <Label>Images</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`Product ${index === 0 ? 'Main' : index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleImageRemove(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                ×
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Main Image
                </div>
              )}
            </div>
          ))}
        </div>
        {formData.images.length < 5 && (
          <div>
            <ImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              images={formData.images}
              maxImages={5}
            />
            <p className="text-sm text-gray-500 mt-2">
              Upload up to 5 images. The first image will be the main product image.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.categoryIds.map((categoryId) => {
            const category = categories.find((c) => c.id === categoryId);
            return (
              <div
                key={categoryId}
                className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-2"
              >
                <span>{category?.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(categoryId)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            );
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
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (onClose) onClose();
            else navigate(-1);
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-skecho-coral hover:bg-skecho-coral-dark text-white"
        >
          {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Product")}
        </Button>
      </div>
    </form>
  );
}; 