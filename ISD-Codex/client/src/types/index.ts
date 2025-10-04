export type UserRole = 'admin' | 'staff' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Product {
  id: number;
  name: string;
  category?: string | null;
  sku: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  supplier?: string | null;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  saleDate: string;
  unitPrice: number;
  revenue: number;
  profit: number;
  customerId?: number | null;
  customerName?: string | null;
}

export interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
}

export interface DashboardData {
  revenueByDay: Array<{ label: string; revenue: number; profit: number; units: number }>;
  revenueByMonth: Array<{ label: string; revenue: number; profit: number; units: number }>;
  bestSeller?: { id: number; name: string; unitsSold: number } | null;
  summary: {
    productsSold: number;
    unitsSold: number;
    revenue: number;
    profit: number;
  } | null;
  lowStock: Array<{ id: number; name: string; sku: string; stockQuantity: number; reorderLevel: number }>;
  topProducts: Array<{ id: number; name: string; unitsSold: number; revenue: number }>;
}
