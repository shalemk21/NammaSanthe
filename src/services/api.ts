import {
  User,
  Shop,
  Product,
  Category,
  Order,
  ReturnRequest,
  Review,
  NotificationItem,
  Dispute,
  PromotionalBanner,
  SellerAnalytics,
  AdminStats,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('nammasanthe_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  auth: {
    async register(data: any): Promise<{ success: boolean; token: string; user: User }> {
      const res = await request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) localStorage.setItem('nammasanthe_token', res.token);
      return res;
    },
    async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
      const res = await request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) localStorage.setItem('nammasanthe_token', res.token);
      return res;
    },
    async getMe(): Promise<{ success: boolean; user: User }> {
      return request<{ success: boolean; user: User }>('/auth/me');
    },
    async updateProfile(data: Partial<User>): Promise<{ success: boolean; user: User }> {
      return request<{ success: boolean; user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async getSeedUsers(): Promise<{ success: boolean; users: any[] }> {
      return request<{ success: boolean; users: any[] }>('/auth/seed-users');
    },
    logout() {
      localStorage.removeItem('nammasanthe_token');
    },
  },

  // Shops
  shops: {
    async getShops(params: { locality?: string; city?: string; search?: string; all?: boolean } = {}): Promise<{
      success: boolean;
      shops: Shop[];
    }> {
      const query = new URLSearchParams();
      if (params.locality) query.set('locality', params.locality);
      if (params.city) query.set('city', params.city);
      if (params.search) query.set('search', params.search);
      if (params.all) query.set('all', 'true');
      return request<{ success: boolean; shops: Shop[] }>(`/shops?${query.toString()}`);
    },
    async getShopById(id: string): Promise<{
      success: boolean;
      shop: Shop;
      products: Product[];
      reviews: Review[];
    }> {
      return request<{ success: boolean; shop: Shop; products: Product[]; reviews: Review[] }>(`/shops/${id}`);
    },
    async updateShop(id: string, updates: Partial<Shop>): Promise<{ success: boolean; shop: Shop }> {
      return request<{ success: boolean; shop: Shop }>(`/shops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async submitVerification(
      id: string,
      data: { notes?: string; documentType?: string; documentNumber?: string }
    ): Promise<{ success: boolean; shop: Shop }> {
      return request<{ success: boolean; shop: Shop }>(`/shops/${id}/verify-request`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Products
  products: {
    async getCategories(): Promise<{ success: boolean; categories: Category[] }> {
      return request<{ success: boolean; categories: Category[] }>('/products/categories');
    },
    async getProducts(params: {
      search?: string;
      category?: string;
      subCategory?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      inStockOnly?: boolean;
      vendorId?: string;
      sort?: string;
      locality?: string;
    } = {}): Promise<{ success: boolean; products: Product[] }> {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.set(key, String(val));
        }
      });
      return request<{ success: boolean; products: Product[] }>(`/products?${query.toString()}`);
    },
    async getProductById(id: string): Promise<{
      success: boolean;
      product: Product;
      shop: Shop;
      reviews: Review[];
      similarProducts: Product[];
    }> {
      return request<{
        success: boolean;
        product: Product;
        shop: Shop;
        reviews: Review[];
        similarProducts: Product[];
      }>(`/products/${id}`);
    },
    async getRecommendations(params: { customerId?: string; preferredCategory?: string } = {}): Promise<{
      success: boolean;
      recommendations: Product[];
    }> {
      const query = new URLSearchParams();
      if (params.customerId) query.set('customerId', params.customerId);
      if (params.preferredCategory) query.set('preferredCategory', params.preferredCategory);
      return request<{ success: boolean; recommendations: Product[] }>(`/products/recommendations?${query.toString()}`);
    },
    async compareProducts(productIds: string[]): Promise<{
      success: boolean;
      comparedProducts: any[];
      bestPriceProductId: string;
      bestRatedProductId: string;
    }> {
      return request<{
        success: boolean;
        comparedProducts: any[];
        bestPriceProductId: string;
        bestRatedProductId: string;
      }>('/products/compare', {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      });
    },
    async createProduct(data: Partial<Product>): Promise<{ success: boolean; product: Product }> {
      return request<{ success: boolean; product: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; product: Product }> {
      return request<{ success: boolean; product: Product }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>(`/products/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Orders
  orders: {
    async createOrder(data: {
      items: { productId: string; quantity: number }[];
      deliveryAddress: string;
      deliverySlot?: string;
      paymentMethod?: string;
      deliveryLocality?: string;
      deliveryPincode?: string;
    }): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async getOrders(params: { status?: string; vendorId?: string } = {}): Promise<{
      success: boolean;
      orders: Order[];
    }> {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.vendorId) query.set('vendorId', params.vendorId);
      return request<{ success: boolean; orders: Order[] }>(`/orders?${query.toString()}`);
    },
    async getOrderById(id: string): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/orders/${id}`);
    },
    async updateOrderStatus(
      id: string,
      status: string,
      note?: string,
      kannadaNote?: string
    ): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note, kannadaNote }),
      });
    },
    async cancelOrder(id: string, reason: string): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
  },

  // Returns & Refunds
  returns: {
    async createReturn(data: {
      orderId: string;
      productId: string;
      reason: string;
      reasonDetails?: string;
      imageEvidence?: string;
    }): Promise<{ success: boolean; returnRequest: ReturnRequest }> {
      return request<{ success: boolean; returnRequest: ReturnRequest }>('/returns', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async getReturns(params: { status?: string; vendorId?: string } = {}): Promise<{
      success: boolean;
      returns: ReturnRequest[];
    }> {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.vendorId) query.set('vendorId', params.vendorId);
      return request<{ success: boolean; returns: ReturnRequest[] }>(`/returns?${query.toString()}`);
    },
    async getReturnById(id: string): Promise<{ success: boolean; returnRequest: ReturnRequest }> {
      return request<{ success: boolean; returnRequest: ReturnRequest }>(`/returns/${id}`);
    },
    async decideReturn(
      id: string,
      decision: 'approved' | 'rejected',
      notes?: string
    ): Promise<{ success: boolean; returnRequest: ReturnRequest }> {
      return request<{ success: boolean; returnRequest: ReturnRequest }>(`/returns/${id}/decision`, {
        method: 'PUT',
        body: JSON.stringify({ decision, notes }),
      });
    },
    async updateReturnStatus(
      id: string,
      status: string,
      note?: string
    ): Promise<{ success: boolean; returnRequest: ReturnRequest }> {
      return request<{ success: boolean; returnRequest: ReturnRequest }>(`/returns/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note }),
      });
    },
  },

  // Reviews
  reviews: {
    async getReviews(params: { productId?: string; vendorId?: string } = {}): Promise<{
      success: boolean;
      reviews: Review[];
    }> {
      const query = new URLSearchParams();
      if (params.productId) query.set('productId', params.productId);
      if (params.vendorId) query.set('vendorId', params.vendorId);
      return request<{ success: boolean; reviews: Review[] }>(`/reviews?${query.toString()}`);
    },
    async createReview(data: {
      productId: string;
      rating: number;
      comment?: string;
    }): Promise<{ success: boolean; review: Review }> {
      return request<{ success: boolean; review: Review }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Notifications
  notifications: {
    async getNotifications(): Promise<{
      success: boolean;
      unreadCount: number;
      notifications: NotificationItem[];
    }> {
      return request<{ success: boolean; unreadCount: number; notifications: NotificationItem[] }>('/notifications');
    },
    async markAsRead(id: string): Promise<{ success: boolean }> {
      return request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' });
    },
    async markAllAsRead(): Promise<{ success: boolean }> {
      return request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' });
    },
  },

  // Seller
  seller: {
    async getAnalytics(vendorId?: string): Promise<{
      success: boolean;
      shop: Shop;
      metrics: SellerAnalytics;
    }> {
      const query = vendorId ? `?vendorId=${vendorId}` : '';
      return request<{ success: boolean; shop: Shop; metrics: SellerAnalytics }>(`/seller/analytics${query}`);
    },
    async updateStock(productId: string, stockCount: number): Promise<{ success: boolean; product: Product }> {
      return request<{ success: boolean; product: Product }>(`/seller/inventory/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ stockCount }),
      });
    },
  },

  // Admin
  admin: {
    async getStats(): Promise<{ success: boolean; stats: AdminStats }> {
      return request<{ success: boolean; stats: AdminStats }>('/admin/stats');
    },
    async getSellers(): Promise<{ success: boolean; sellers: Shop[] }> {
      return request<{ success: boolean; sellers: Shop[] }>('/admin/sellers');
    },
    async verifySeller(
      id: string,
      status: 'verified' | 'rejected' | 'suspended' | 'pending',
      notes?: string
    ): Promise<{ success: boolean; shop: Shop }> {
      return request<{ success: boolean; shop: Shop }>(`/admin/sellers/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
    },
    async getListings(): Promise<{ success: boolean; products: Product[] }> {
      return request<{ success: boolean; products: Product[] }>('/admin/listings');
    },
    async flagListing(id: string, isSuspicious: boolean): Promise<{ success: boolean; product: Product }> {
      return request<{ success: boolean; product: Product }>(`/admin/listings/${id}/flag`, {
        method: 'PUT',
        body: JSON.stringify({ isSuspicious }),
      });
    },
    async getDisputes(): Promise<{ success: boolean; disputes: Dispute[] }> {
      return request<{ success: boolean; disputes: Dispute[] }>('/admin/disputes');
    },
    async resolveDispute(
      id: string,
      decision: string,
      status: 'resolved' | 'dismissed',
      action?: 'refund' | 'close'
    ): Promise<{ success: boolean; dispute: Dispute }> {
      return request<{ success: boolean; dispute: Dispute }>(`/admin/disputes/${id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ decision, status, action }),
      });
    },
    async getBanners(): Promise<{ success: boolean; banners: PromotionalBanner[] }> {
      return request<{ success: boolean; banners: PromotionalBanner[] }>('/admin/banners');
    },
    async createBanner(data: Partial<PromotionalBanner>): Promise<{ success: boolean; banner: PromotionalBanner }> {
      return request<{ success: boolean; banner: PromotionalBanner }>('/admin/banners', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async updateBanner(id: string, updates: Partial<PromotionalBanner>): Promise<{ success: boolean; banner: PromotionalBanner }> {
      return request<{ success: boolean; banner: PromotionalBanner }>(`/admin/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  // Mock Payment
  payments: {
    async processDemoPayment(data: {
      amount: number;
      method: string;
      orderReference?: string;
    }): Promise<{ success: boolean; transactionId: string; message: string }> {
      return request<{ success: boolean; transactionId: string; message: string }>('/payments/process-demo', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};
