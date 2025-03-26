export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  images: string[];
  mainImage: string;
  price?: string; // Optional as prices might be available only upon request
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRequest {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  message: string;
  status: 'pending' | 'processed' | 'rejected';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
}