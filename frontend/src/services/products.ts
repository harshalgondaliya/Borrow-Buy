import { apiRequest } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  _count?: {
    products: number;
  };
}

export interface ProductOwner {
  id: string;
  fullName: string;
  trustScore: number;
  isVerifiedOwner: boolean;
  avatarUrl?: string;
  ownerAddress?: string;
  ownerBio?: string;
  phone?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface Product {
  id: string;
  ownerId: string;
  categoryId: string;
  name: string;
  description: string;
  brand?: string;
  model?: string;
  pricePerDay: number;
  securityDeposit: number;
  condition: 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  location: string;
  images: string[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  listingStatus: 'ACTIVE' | 'INACTIVE' | 'RENTED' | 'UNDER_MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  category: Category;
  owner: ProductOwner;
  reviews?: Review[];
  reviewCount?: number;
  averageRating?: number;
  bookings?: Array<{
    startDate: string;
    endDate: string;
    status: string;
  }>;
  _count?: {
    bookings: number;
  };
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'deposit_asc';
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  success: boolean;
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productsService = {
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return apiRequest('/products/categories');
  },

  async listProducts(params: ProductQueryParams = {}): Promise<ProductListResponse> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params.condition) query.append('condition', params.condition);
    if (params.location) query.append('location', params.location);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    return apiRequest(`/products/${id}`);
  },

  async getOwnerProducts(): Promise<{ success: boolean; data: Product[] }> {
    return apiRequest('/products/owner/my-listings');
  },

  async createProduct(formData: FormData): Promise<{ success: boolean; data: Product }> {
    const token = localStorage.getItem('borrowbuy_token');
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const response = await fetch(`${apiUrl}/products`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create product listing');
    }
    return data;
  },

  async updateProduct(id: string, formData: FormData): Promise<{ success: boolean; data: Product }> {
    const token = localStorage.getItem('borrowbuy_token');
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const response = await fetch(`${apiUrl}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product listing');
    }
    return data;
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/products/${id}`, { method: 'DELETE' });
  },
};

