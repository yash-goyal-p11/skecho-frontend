import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AddProductForm } from "@/components/AddProductForm";
import { useAuth } from "@/lib/AuthContext";
import { fetchProduct } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: productData, isLoading, error: queryError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    setProduct(productData);
    setLoading(isLoading);
    setError(queryError?.message);
  }, [productData, isLoading, queryError]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (queryError) return <div className="min-h-screen flex items-center justify-center text-red-600">Failed to load product</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20 py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <AddProductForm
          initialData={product}
          isEdit
          onSuccess={() => navigate("/dashboard")}
          onClose={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
};

export default EditProduct; 