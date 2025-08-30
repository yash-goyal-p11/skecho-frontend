import axios from 'axios';
import { Product, Seller, Category, Cart, CartItem, User } from './types';

const API_BASE = 'http://localhost:3000/api'; ///skecho.com

// Products
export const fetchProducts = async (params?: Record<string, any>): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> => {
  const res = await axios.get(`${API_BASE}/products`, { params });
  return res.data;
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const res = await axios.get(`${API_BASE}/products/${id}`);
  return res.data;
};

// Sellers
export const fetchSellers = async (): Promise<Seller[]> => {
  const res = await axios.get(`${API_BASE}/seller`);
  return res.data;
};

export const fetchSeller = async (id: string): Promise<Seller> => {
  const res = await axios.get(`${API_BASE}/seller/${id}`);
  return res.data;
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await axios.get(`${API_BASE}/categories`);
  return res.data;
};

// Cart (requires auth)
export const fetchCart = async (token: string): Promise<Cart> => {
  const res = await axios.get(`${API_BASE}/cart`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const addToCart = async (token: string, productId: string, quantity: number = 1): Promise<CartItem> => {
  const res = await axios.post(`${API_BASE}/cart/items`, { productId, quantity }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateCartItem = async (token: string, itemId: string, quantity: number): Promise<CartItem> => {
  const res = await axios.put(`${API_BASE}/cart/items/${itemId}`, { quantity }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const removeCartItem = async (token: string, itemId: string): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_BASE}/cart/items/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// User (requires auth)
export const fetchUserProfile = async (token: string): Promise<User> => {
  const res = await axios.get(`${API_BASE}/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// Check seller profile completion
export const checkSellerProfileCompletion = async (token: string): Promise<{ isComplete: boolean }> => {
  const res = await axios.get(`${API_BASE}/seller/profile-complete`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// Products (mutations)
export const deleteProduct = async (token: string, productId: string): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_BASE}/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// Create a new product
export const createProduct = async (token: string, formData: FormData): Promise<any> => {
  const res = await axios.post(`${API_BASE}/products`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Update an existing product
export const updateProduct = async (token: string, productId: string, formData: FormData): Promise<any> => {
  const res = await axios.put(`${API_BASE}/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Update product availability
export const updateProductAvailability = async (token: string, productId: string, isAvailable: boolean): Promise<any> => {
  const res = await axios.put(`${API_BASE}/products/${productId}`, { isAvailable }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Create a new category
export const createCategory = async (token: string, data: { name: string }): Promise<any> => {
  const res = await axios.post(`${API_BASE}/categories`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Custom Orders (mutations)
export const updateCustomOrderStatus = async (
  token: string,
  orderId: string,
  status: string,
  rejectionReason?: string | null
): Promise<any> => {
  const res = await axios.patch(
    `${API_BASE}/custom-orders/${orderId}`,
    { status, rejectionReason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Custom Orders (fetch for artist)
export const fetchCustomOrdersForArtist = async (token: string, artistId: string): Promise<any[]> => {
  const res = await axios.get(`${API_BASE}/custom-orders/artist/${artistId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// Custom Orders (fetch for user)
export const fetchCustomOrdersForUser = async (token: string, userId: string): Promise<any[]> => {
  const res = await axios.get(`${API_BASE}/custom-orders/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// Product Orders (fetch for user)
export const fetchProductOrdersForUser = async (token: string, userId: string): Promise<any[]> => {
  const res = await axios.get(`${API_BASE}/product-orders/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// Create a new product order
export const createProductOrder = async (token: string, userId: string, productId: string): Promise<any> => {
  const res = await axios.post(`${API_BASE}/product-orders`, { userId, productId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}; 