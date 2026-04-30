import axios, { type AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('customer');
    }
    return Promise.reject(error);
  }
);

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'ARTWORK' | 'MERCHANDISE' | 'CREATOR_KIT';
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  basePrice: number;
  compareAtPrice: number | null;
  category: string | null;
  tags: string[];
  orientation: string | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  // Legacy compatibility
  isActive?: boolean;
  isFeatured?: boolean;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PREORDER';
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  stockQuantity: number;
  size?: string;
  material?: string;
  frame?: string;
  color?: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// PRODUCT API
// ============================================

export const productApi = {
  /**
   * Get all products
   */
  async getAll(params?: {
    type?: 'ARTWORK' | 'MERCHANDISE' | 'CREATOR_KIT';
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/api/products', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch products');
    }
    return response.data.data.map(p => ({
      ...p,
      images: p.images?.map((img: any) => typeof img === 'string' ? { id: '', url: img, altText: null, sortOrder: 0 } : img) || []
    }));
  },

  /**
   * Get single product by ID
   */
  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/api/products/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch product');
    }
    return response.data.data;
  },

  /**
   * Get featured products
   */
  async getFeatured(limit = 6): Promise<Product[]> {
    return productApi.getAll({ featured: true, limit });
  },

  /**
   * Get products by category
   */
  async getByCategory(category: string, limit?: number): Promise<Product[]> {
    return productApi.getAll({ category, limit });
  },
};

// ============================================
// EMAIL OTP AUTH API
// ============================================

export interface SendOTPResponse {
  email: string;
  expiresIn: number;
}

export interface VerifyOTPResponse {
  token: string;
  customer: {
    id: string;
    email: string | null;
    name: string | null;
  };
}

export const authApi = {
  /**
   * Send OTP to email
   */
  async sendOTP(email: string): Promise<SendOTPResponse> {
    const response = await apiClient.post<ApiResponse<SendOTPResponse>>(
      '/api/auth/email/send-otp',
      { email }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to send OTP');
    }
    return response.data.data;
  },

  /**
   * Verify OTP and get auth token
   */
  async verifyOTP(email: string, token: string): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>(
      '/api/auth/email/verify-otp',
      { email, token }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Invalid or expired OTP');
    }

    // Store token and customer data
    localStorage.setItem('auth_token', response.data.data.token);
    localStorage.setItem('customer', JSON.stringify(response.data.data.customer));

    return response.data.data;
  },

  /**
   * Get current customer profile
   */
  async getProfile() {
    const response = await apiClient.get<ApiResponse<{ customer: any }>>('/api/auth/email/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch profile');
    }
    return response.data.data.customer;
  },

  /**
   * Logout - clear local storage
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer');
  },
};

// ============================================
// ADDRESS API
// ============================================

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export const addressApi = {
  /**
   * Get all addresses for current customer
   */
  async getAll(): Promise<Address[]> {
    const response = await apiClient.get<ApiResponse<{ addresses: Address[] }>>('/api/addresses');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch addresses');
    }
    return response.data.data.addresses;
  },

  /**
   * Create new address
   */
  async create(address: CreateAddressInput): Promise<Address> {
    const response = await apiClient.post<ApiResponse<{ address: Address }>>(
      '/api/addresses',
      address
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create address');
    }
    return response.data.data.address;
  },

  /**
   * Update existing address
   */
  async update(id: string, address: Partial<CreateAddressInput>): Promise<Address> {
    const response = await apiClient.put<ApiResponse<{ address: Address }>>(
      `/api/addresses/${id}`,
      address
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update address');
    }
    return response.data.data.address;
  },

  /**
   * Delete address
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/addresses/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete address');
    }
  },
};

// ============================================
// CART API
// ============================================

export interface CartItem {
  variantId: string;
  quantity: number;
}

export interface CartSyncResponse {
  cart: {
    items: Array<{
      variantId: string;
      quantity: number;
    }>;
  };
}

export const cartApi = {
  /**
   * Sync cart with backend
   */
  async sync(items: CartItem[]): Promise<CartSyncResponse> {
    const response = await apiClient.post<ApiResponse<CartSyncResponse>>(
      '/api/cart/sync',
      { items }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to sync cart');
    }
    return response.data.data;
  },

  /**
   * Add item to cart
   */
  async addItem(variantId: string, quantity: number): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/api/cart/items',
      { variantId, quantity }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to add item to cart');
    }
  },

  /**
   * Remove item from cart
   */
  async removeItem(variantId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/cart/items/${variantId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to remove item from cart');
    }
  },

  /**
   * Update item quantity
   */
  async updateItem(variantId: string, quantity: number): Promise<void> {
    const response = await apiClient.put<ApiResponse<void>>(
      `/api/cart/items/${variantId}`,
      { quantity }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update item quantity');
    }
  },

  /**
   * Clear entire cart
   */
  async clear(): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>('/api/cart');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to clear cart');
    }
  },
};

// ============================================
// ORDER API
// ============================================

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    price: string;
    image?: string;
  }>;
  address: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  cashfree?: {
    paymentSessionId: string;
  };
}

export const orderApi = {
  /**
   * Get all orders for current customer
   */
  async getAll(): Promise<{ orders: Order[] }> {
    const response = await apiClient.get<ApiResponse<{ orders: Order[] }>>('/api/orders');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch orders');
    }
    return response.data.data;
  },

  /**
   * Get single order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<{ order: Order }> {
    const response = await apiClient.get<ApiResponse<{ order: Order }>>(`/api/orders/${orderNumber}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch order');
    }
    return response.data.data;
  },

  /**
   * Create new order
   */
  async create(addressId: string): Promise<{ orderNumber: string; cashfree: { paymentSessionId: string } }> {
    const response = await apiClient.post<ApiResponse<{ orderNumber: string; cashfree: { paymentSessionId: string } }>>(
      '/api/orders',
      { addressId }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create order');
    }
    return response.data.data;
  },

  /**
   * Validate cart before checkout
   */
  async validateCart(): Promise<{ valid: boolean; issues?: any[] }> {
    const response = await apiClient.post<ApiResponse<{ valid: boolean; issues?: any[] }>>('/api/orders/validate-cart');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to validate cart');
    }
    return response.data.data;
  },

  /**
   * Verify payment status after payment completion
   */
  async verifyPayment(orderNumber: string): Promise<{ order: Order; paymentVerified: boolean }> {
    const response = await apiClient.post<ApiResponse<{ order: Order; paymentVerified: boolean }>>(
      `/api/orders/${orderNumber}/verify-payment`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to verify payment');
    }
    return response.data.data;
  },
};

// ============================================
// STUDIO BOOKING API
// ============================================

export interface StudioBookingData {
  studioType: string;
  duration: string;
  preferredDate: string;
  preferredTime?: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface StudioSpace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  features: string[] | null;
  imageUrl: string | null;
}

export const studioBookingApi = {
  /**
   * Get available studio spaces
   */
  async getSpaces(): Promise<StudioSpace[]> {
    const response = await apiClient.get<ApiResponse<{ spaces: StudioSpace[] }>>(
      '/api/studio-bookings/spaces'
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch studio spaces');
    }
    return response.data.data.spaces;
  },

  /**
   * Create studio booking
   */
  async create(data: StudioBookingData): Promise<{ booking: any; message: string }> {
    const response = await apiClient.post<ApiResponse<{ booking: any; message: string }>>(
      '/api/studio-bookings',
      data
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create booking');
    }
    return response.data.data;
  },
};

export default apiClient;
