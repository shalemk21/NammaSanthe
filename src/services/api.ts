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
  SavedAddress,
  NotificationPreferences,
  PaymentTransaction,
  RefundTransaction,
  AuditLog,
  FulfillmentType,
  WebhookNotification,
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

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`Server returned error ${res.status}: ${res.statusText || 'API endpoint not available'}`);
    }
    throw new Error('Server returned an unexpected non-JSON response');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth & Addresses
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
    async getAddresses(): Promise<{ success: boolean; addresses: SavedAddress[] }> {
      return request<{ success: boolean; addresses: SavedAddress[] }>('/auth/addresses');
    },
    async addAddress(data: Omit<SavedAddress, 'id' | 'userId' | 'createdAt'>): Promise<{ success: boolean; address: SavedAddress }> {
      return request<{ success: boolean; address: SavedAddress }>('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async updateAddress(id: string, data: Partial<SavedAddress>): Promise<{ success: boolean; address: SavedAddress }> {
      return request<{ success: boolean; address: SavedAddress }>(`/auth/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async deleteAddress(id: string): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>(`/auth/addresses/${id}`, {
        method: 'DELETE',
      });
    },
    async updateNotificationPreferences(
      prefs: Partial<NotificationPreferences>
    ): Promise<{ success: boolean; notificationPreferences: NotificationPreferences }> {
      return request<{ success: boolean; notificationPreferences: NotificationPreferences }>(
        '/auth/notification-preferences',
        {
          method: 'PUT',
          body: JSON.stringify(prefs),
        }
      );
    },
    async getSeedUsers(): Promise<{ success: boolean; users: any[] }> {
      return request<{ success: boolean; users: any[] }>('/auth/seed-users');
    },
    async getDbStatus(): Promise<{ success: boolean; database: any }> {
      return request<{ success: boolean; database: any }>('/auth/db-status');
    },
    logout() {
      localStorage.removeItem('nammasanthe_token');
    },
  },

  // Shops
  shops: {
    async getShops(params: { locality?: string; city?: string; search?: string; pincode?: string; all?: boolean } = {}): Promise<{
      success: boolean;
      shops: Shop[];
    }> {
      const query = new URLSearchParams();
      if (params.locality) query.set('locality', params.locality);
      if (params.city) query.set('city', params.city);
      if (params.search) query.set('search', params.search);
      if (params.pincode) query.set('pincode', params.pincode);
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
      fulfillmentType?: FulfillmentType;
      deliveryAddress?: string;
      deliverySlot?: string;
      pickupSlot?: string;
      paymentMethod?: string;
      deliveryLocality?: string;
      deliveryPincode?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    }): Promise<{
      success: boolean;
      order: Order;
      orders?: Order[];
      parentOrderId?: string;
      isMultiShop?: boolean;
      message?: string;
    }> {
      return request<{
        success: boolean;
        order: Order;
        orders?: Order[];
        parentOrderId?: string;
        isMultiShop?: boolean;
        message?: string;
      }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async getOrders(params: {
      status?: string;
      vendorId?: string;
      fulfillmentType?: string;
      paymentStatus?: string;
    } = {}): Promise<{
      success: boolean;
      orders: Order[];
    }> {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.vendorId) query.set('vendorId', params.vendorId);
      if (params.fulfillmentType) query.set('fulfillmentType', params.fulfillmentType);
      if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus);
      return request<{ success: boolean; orders: Order[] }>(`/orders?${query.toString()}`);
    },
    async getOrderById(id: string): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/orders/${id}`);
    },
    async updateOrderStatus(
      id: string,
      status: string,
      note?: string,
      kannadaNote?: string,
      trackingReference?: string
    ): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note, kannadaNote, trackingReference }),
      });
    },
    async cancelOrder(id: string, reason: string): Promise<{ success: boolean; order: Order }> {
      return request<{ success: boolean; order: Order }>(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    async getInvoice(id: string): Promise<{ success: boolean; invoice: any }> {
      return request<{ success: boolean; invoice: any }>(`/orders/${id}/invoice`);
    },
    async updateRiderGps(
      id: string,
      data: { latitude: number; longitude: number; addressLabel?: string }
    ): Promise<{ success: boolean; order: Order; message: string }> {
      return request<{ success: boolean; order: Order; message: string }>(`/orders/${id}/gps`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    async verifyHandover(
      id: string,
      data: { qrToken?: string; deliveryOtp?: string }
    ): Promise<{ success: boolean; order: Order; message: string }> {
      return request<{ success: boolean; order: Order; message: string }>(`/orders/${id}/verify-handover`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async collectCash(
      id: string,
      data: { amountCollected?: number; notes?: string }
    ): Promise<{ success: boolean; order: Order; message: string }> {
      return request<{ success: boolean; order: Order; message: string }>(`/orders/${id}/collect-cash`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Payments (Razorpay Sandbox & Production)
  payments: {
    async getConfig(): Promise<{
      success: boolean;
      keyId: string;
      currency: string;
      isSandbox: boolean;
      supportedMethods: string[];
      gatewayName: string;
    }> {
      return request<{
        success: boolean;
        keyId: string;
        currency: string;
        isSandbox: boolean;
        supportedMethods: string[];
        gatewayName: string;
      }>('/payments/config');
    },
    async verifyPincode(pincode: string): Promise<{
      success: boolean;
      serviceable: boolean;
      pincode?: string;
      servicingShopsCount?: number;
      message?: string;
    }> {
      return request<{
        success: boolean;
        serviceable: boolean;
        pincode?: string;
        servicingShopsCount?: number;
        message?: string;
      }>(`/payments/verify-pincode/${pincode}`);
    },
    async createOrder(data: {
      amount: number;
      currency?: string;
      receipt?: string;
      notes?: any;
      idempotencyKey?: string;
    }): Promise<{
      success: boolean;
      gatewayOrderId: string;
      amount: number;
      amountRupees: number;
      currency: string;
      keyId: string;
      receipt: string;
      transactionId?: string;
    }> {
      return request<{
        success: boolean;
        gatewayOrderId: string;
        amount: number;
        amountRupees: number;
        currency: string;
        keyId: string;
        receipt: string;
        transactionId?: string;
      }>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async verifyPayment(data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      paymentMethod?: string;
      orderId?: string;
    }): Promise<{
      success: boolean;
      verified: boolean;
      paymentId: string;
      gatewayOrderId: string;
      status: string;
      message: string;
    }> {
      return request<{
        success: boolean;
        verified: boolean;
        paymentId: string;
        gatewayOrderId: string;
        status: string;
        message: string;
      }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async recordFailure(data: {
      razorpay_order_id?: string;
      reason?: string;
      code?: string;
      orderId?: string;
    }): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>('/payments/record-failure', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async refund(data: {
      orderId: string;
      amount: number;
      reason?: string;
    }): Promise<{ success: boolean; refund: RefundTransaction; message: string }> {
      return request<{ success: boolean; refund: RefundTransaction; message: string }>('/payments/refund', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async generateSandboxSignature(data: {
      orderId: string;
      paymentId?: string;
    }): Promise<{ success: boolean; paymentId: string; orderId: string; signature: string }> {
      return request<{ success: boolean; paymentId: string; orderId: string; signature: string }>(
        '/payments/generate-sandbox-signature',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
    // Legacy demo payment endpoint
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
    async getReviews(params: { productId?: string; vendorId?: string; includeHidden?: boolean } = {}): Promise<{
      success: boolean;
      reviews: Review[];
    }> {
      const query = new URLSearchParams();
      if (params.productId) query.set('productId', params.productId);
      if (params.vendorId) query.set('vendorId', params.vendorId);
      if (params.includeHidden) query.set('includeHidden', 'true');
      return request<{ success: boolean; reviews: Review[] }>(`/reviews?${query.toString()}`);
    },
    async createReview(data: {
      productId: string;
      rating: number;
      comment?: string;
      photos?: string[];
    }): Promise<{ success: boolean; review: Review }> {
      return request<{ success: boolean; review: Review }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async updateReview(
      id: string,
      data: { rating?: number; comment?: string }
    ): Promise<{ success: boolean; review: Review }> {
      return request<{ success: boolean; review: Review }>(`/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async deleteReview(id: string): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>(`/reviews/${id}`, {
        method: 'DELETE',
      });
    },
    async reportReview(id: string, reason: string): Promise<{ success: boolean; message: string }> {
      return request<{ success: boolean; message: string }>(`/reviews/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
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
    async simulateWebhook(data: {
      orderId?: string;
      event?: string;
      recipientPhone?: string;
      recipientName?: string;
      channel?: 'whatsapp' | 'sms' | 'both';
      amount?: number;
      vendorName?: string;
      riderName?: string;
      otp?: string;
    }): Promise<{ success: boolean; message: string; notifications: WebhookNotification[] }> {
      return request<{ success: boolean; message: string; notifications: WebhookNotification[] }>('/notifications/webhook/simulate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async getWebhookLogs(): Promise<{ success: boolean; count: number; logs: WebhookNotification[] }> {
      return request<{ success: boolean; count: number; logs: WebhookNotification[] }>('/notifications/webhook/logs');
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
    async getReportedReviews(): Promise<{ success: boolean; count: number; reviews: Review[] }> {
      return request<{ success: boolean; count: number; reviews: Review[] }>('/admin/reviews/reported');
    },
    async moderateReview(
      id: string,
      action: 'keep' | 'hide' | 'dismiss'
    ): Promise<{ success: boolean; review: Review }> {
      return request<{ success: boolean; review: Review }>(`/admin/reviews/${id}/moderate`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      });
    },
    async getAuditLogs(): Promise<{ success: boolean; count: number; logs: AuditLog[] }> {
      return request<{ success: boolean; count: number; logs: AuditLog[] }>('/admin/audit-logs');
    },
    async getFinancials(): Promise<{
      success: boolean;
      payments: PaymentTransaction[];
      refunds: RefundTransaction[];
    }> {
      return request<{
        success: boolean;
        payments: PaymentTransaction[];
        refunds: RefundTransaction[];
      }>('/admin/financials');
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
};
