// Product
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  isAvailable: boolean;
  quantity: number;
  createdAt: string;
  seller: SellerSummary;
  categories: Category[];
}

export interface SellerSummary {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

// Seller/Artist
export interface Seller {
  id: string;
  userId: string;
  bio?: string;
  profileImage?: string | null;
  portfolioImages: string[];
  doesCustomArt: boolean;
  customArtPricing?: any;
  materialOptions?: any;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    firebaseUid: string;
  };
  products: Product[];
  categories: Category[];
}

// Category
export interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: {
    products: number;
  };
}

// Cart
export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

// User
export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  phone?: string;
  phoneVerified: boolean;
  profileCompleted: boolean;
  isSeller: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: any[];
  sellerProfile?: Seller;
} 