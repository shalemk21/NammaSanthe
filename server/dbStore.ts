import fs from 'fs';
import path from 'path';
import {
  User,
  Shop,
  Category,
  Product,
  Order,
  ReturnRequest,
  Review,
  Dispute,
  NotificationItem,
  PromotionalBanner,
} from './types';
import {
  SEED_USERS,
  SEED_SHOPS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_ORDERS,
  SEED_RETURNS,
  SEED_DISPUTES,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS,
  SEED_BANNERS,
} from './data/seedData';

import { fileURLToPath } from 'url';

interface DatabaseSchema {
  users: User[];
  shops: Shop[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  returns: ReturnRequest[];
  disputes: Dispute[];
  reviews: Review[];
  notifications: NotificationItem[];
  banners: PromotionalBanner[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'data', 'db.json');

class DatabaseStore {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = {
      users: [],
      shops: [],
      categories: [],
      products: [],
      orders: [],
      returns: [],
      disputes: [],
      reviews: [],
      notifications: [],
      banners: [],
    };
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all arrays exist
        this.data.users = this.data.users || [...SEED_USERS];
        this.data.shops = this.data.shops || [...SEED_SHOPS];
        this.data.categories = this.data.categories || [...SEED_CATEGORIES];
        this.data.products = this.data.products || [...SEED_PRODUCTS];
        this.data.orders = this.data.orders || [...SEED_ORDERS];
        this.data.returns = this.data.returns || [...SEED_RETURNS];
        this.data.disputes = this.data.disputes || [...SEED_DISPUTES];
        this.data.reviews = this.data.reviews || [...SEED_REVIEWS];
        this.data.notifications = this.data.notifications || [...SEED_NOTIFICATIONS];
        this.data.banners = this.data.banners || [...SEED_BANNERS];
      } else {
        this.data = {
          users: [...SEED_USERS],
          shops: [...SEED_SHOPS],
          categories: [...SEED_CATEGORIES],
          products: [...SEED_PRODUCTS],
          orders: [...SEED_ORDERS],
          returns: [...SEED_RETURNS],
          disputes: [...SEED_DISPUTES],
          reviews: [...SEED_REVIEWS],
          notifications: [...SEED_NOTIFICATIONS],
          banners: [...SEED_BANNERS],
        };
        this.save();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Error initializing dbStore, using in-memory fallback:', err);
      this.data = {
        users: [...SEED_USERS],
        shops: [...SEED_SHOPS],
        categories: [...SEED_CATEGORIES],
        products: [...SEED_PRODUCTS],
        orders: [...SEED_ORDERS],
        returns: [...SEED_RETURNS],
        disputes: [...SEED_DISPUTES],
        reviews: [...SEED_REVIEWS],
        notifications: [...SEED_NOTIFICATIONS],
        banners: [...SEED_BANNERS],
      };
      this.isLoaded = true;
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to db.json:', err);
    }
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- SHOPS ---
  getShops(): Shop[] {
    return this.data.shops;
  }

  getShopById(id: string): Shop | undefined {
    return this.data.shops.find((s) => s.id === id);
  }

  getShopByOwnerId(ownerId: string): Shop | undefined {
    return this.data.shops.find((s) => s.ownerId === ownerId);
  }

  createShop(shop: Shop): Shop {
    this.data.shops.push(shop);
    this.save();
    return shop;
  }

  updateShop(id: string, updates: Partial<Shop>): Shop | undefined {
    const idx = this.data.shops.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.shops[idx] = { ...this.data.shops[idx], ...updates };
    this.save();
    return this.data.shops[idx];
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  createProduct(product: Product): Product {
    this.data.products.push(product);
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  // Stock decrement & reservation on checkout
  reserveAndDecrementStock(productId: string, quantity: number): boolean {
    const p = this.getProductById(productId);
    if (!p) return false;
    if (p.stockCount < quantity) return false;

    p.stockCount -= quantity;
    p.reservedCount = (p.reservedCount || 0) + quantity;
    p.inStock = p.stockCount > 0;
    this.save();
    return true;
  }

  // Stock restoration on cancellation or return
  restoreStock(productId: string, quantity: number): void {
    const p = this.getProductById(productId);
    if (!p) return;
    p.stockCount += quantity;
    if (p.reservedCount >= quantity) {
      p.reservedCount -= quantity;
    }
    p.inStock = p.stockCount > 0;
    this.save();
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrderStatus(
    id: string,
    status: Order['status'],
    stepDescription?: string,
    kannadaStepDescription?: string
  ): Order | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;
    order.status = status;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const stepNameMap: Record<string, { en: string; kn: string }> = {
      confirmed: { en: 'Order Confirmed', kn: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
      processing: { en: 'Processing Order', kn: 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ' },
      packed: { en: 'Packed at Local Store', kn: 'ಪ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ' },
      shipped: { en: 'Out for Local Delivery', kn: 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ' },
      delivered: { en: 'Delivered Successfully', kn: 'ತಲುಪಿಸಲಾಗಿದೆ' },
      cancelled: { en: 'Order Cancelled', kn: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ' },
    };

    const info = stepNameMap[status] || { en: status, kn: status };

    // Update tracking steps
    const newStep = {
      step: info.en,
      kannadaStep: info.kn,
      time: timeStr,
      completed: true,
      current: status !== 'delivered' && status !== 'cancelled',
      description: stepDescription || `Status changed to ${status}`,
    };

    order.trackingSteps = order.trackingSteps.map((s) => ({ ...s, current: false }));
    order.trackingSteps.push(newStep);

    this.save();
    return order;
  }

  cancelOrder(id: string, reason: string): Order | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return undefined; // Already terminal
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;

    // Restore stock for all items
    for (const item of order.items) {
      this.restoreStock(item.productId, item.quantity);
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    order.trackingSteps.push({
      step: 'Order Cancelled',
      kannadaStep: 'ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
      time: timeStr,
      completed: true,
      current: true,
      description: `Cancelled: ${reason}. Inventory restored to seller.`,
    });

    this.save();
    return order;
  }

  // --- RETURNS & REFUNDS ---
  getReturns(): ReturnRequest[] {
    return this.data.returns;
  }

  getReturnById(id: string): ReturnRequest | undefined {
    return this.data.returns.find((r) => r.id === id);
  }

  createReturn(returnReq: ReturnRequest): ReturnRequest {
    this.data.returns.unshift(returnReq);
    this.save();
    return returnReq;
  }

  updateReturn(id: string, updates: Partial<ReturnRequest>): ReturnRequest | undefined {
    const idx = this.data.returns.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.data.returns[idx] = { ...this.data.returns[idx], ...updates };
    this.save();
    return this.data.returns[idx];
  }

  // --- DISPUTES ---
  getDisputes(): Dispute[] {
    return this.data.disputes;
  }

  getDisputeById(id: string): Dispute | undefined {
    return this.data.disputes.find((d) => d.id === id);
  }

  createDispute(dispute: Dispute): Dispute {
    this.data.disputes.unshift(dispute);
    this.save();
    return dispute;
  }

  updateDispute(id: string, updates: Partial<Dispute>): Dispute | undefined {
    const idx = this.data.disputes.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.data.disputes[idx] = { ...this.data.disputes[idx], ...updates };
    this.save();
    return this.data.disputes[idx];
  }

  // --- REVIEWS ---
  getReviews(): Review[] {
    return this.data.reviews;
  }

  createReview(review: Review): Review {
    this.data.reviews.unshift(review);

    // Recalculate product rating
    const prodReviews = this.data.reviews.filter((r) => r.productId === review.productId);
    const avg =
      prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / prodReviews.length;
    this.updateProduct(review.productId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: prodReviews.length,
    });

    // Recalculate shop rating
    const shopReviews = this.data.reviews.filter((r) => r.vendorId === review.vendorId);
    if (shopReviews.length > 0) {
      const shopAvg =
        shopReviews.reduce((acc, curr) => acc + curr.rating, 0) / shopReviews.length;
      this.updateShop(review.vendorId, {
        rating: parseFloat(shopAvg.toFixed(1)),
        reviewsCount: shopReviews.length,
      });
    }

    this.save();
    return review;
  }

  // --- NOTIFICATIONS ---
  getNotifications(): NotificationItem[] {
    return this.data.notifications;
  }

  createNotification(notif: NotificationItem): NotificationItem {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.isRead = true;
    this.save();
    return true;
  }

  markAllNotificationsAsRead(recipientId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.recipientId === recipientId) n.isRead = true;
    });
    this.save();
  }

  // --- BANNERS ---
  getBanners(): PromotionalBanner[] {
    return this.data.banners;
  }

  createBanner(banner: PromotionalBanner): PromotionalBanner {
    this.data.banners.push(banner);
    this.save();
    return banner;
  }

  updateBanner(id: string, updates: Partial<PromotionalBanner>): PromotionalBanner | undefined {
    const idx = this.data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    this.save();
    return this.data.banners[idx];
  }

  // --- CALCULATED SELLER ANALYTICS ---
  getSellerAnalytics(vendorId: string) {
    const vendorOrders = this.data.orders.filter((o) => o.vendorId === vendorId);
    const completedOrders = vendorOrders.filter((o) => o.status === 'delivered');
    const cancelledOrders = vendorOrders.filter((o) => o.status === 'cancelled');

    const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const activeProducts = this.data.products.filter((p) => p.vendorId === vendorId);
    const lowStockProducts = activeProducts.filter((p) => p.stockCount <= 10);

    // Sales by day (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesByDay: Record<string, { amount: number; orders: number }> = {};
    days.forEach((d) => {
      salesByDay[d] = { amount: 0, orders: 0 };
    });

    vendorOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const dayName = days[d.getDay()];
      if (salesByDay[dayName]) {
        salesByDay[dayName].amount += o.totalAmount;
        salesByDay[dayName].orders += 1;
      }
    });

    const weeklySalesData = days.map((day) => ({
      day,
      date: day,
      amount: salesByDay[day].amount,
      orders: salesByDay[day].orders,
    }));

    // Top selling products for this vendor
    const productSalesCount: Record<string, { count: number; revenue: number }> = {};
    vendorOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSalesCount[item.productId]) {
          productSalesCount[item.productId] = { count: 0, revenue: 0 };
        }
        productSalesCount[item.productId].count += item.quantity;
        productSalesCount[item.productId].revenue += item.priceSnapshot * item.quantity;
      });
    });

    const topProducts = activeProducts
      .map((p) => {
        const stats = productSalesCount[p.id] || { count: 0, revenue: 0 };
        return {
          id: p.id,
          name: p.name,
          image: p.image,
          salesCount: stats.count,
          revenue: stats.revenue,
          stockCount: p.stockCount,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const vendorReturns = this.data.returns.filter((r) => r.vendorId === vendorId);
    const returnRate =
      vendorOrders.length > 0
        ? parseFloat(((vendorReturns.length / vendorOrders.length) * 100).toFixed(1))
        : 0;

    const cancelRate =
      vendorOrders.length > 0
        ? parseFloat(((cancelledOrders.length / vendorOrders.length) * 100).toFixed(1))
        : 0;

    return {
      totalSales: totalRevenue,
      totalOrders: vendorOrders.length,
      completedOrdersCount: completedOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      activeProductsCount: activeProducts.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      returnRate,
      cancelRate,
      weeklySalesData,
      topProducts,
    };
  }

  // --- CALCULATED ADMIN STATS ---
  getAdminStats() {
    const totalGMV = this.data.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = this.data.orders.length;
    const completedOrders = this.data.orders.filter((o) => o.status === 'delivered').length;
    const pendingVerifications = this.data.shops.filter(
      (s) => s.verificationStatus === 'pending'
    ).length;
    const totalSellers = this.data.shops.length;
    const activeProducts = this.data.products.length;
    const totalCustomers = this.data.users.filter((u) => u.role === 'customer').length;
    const openDisputes = this.data.disputes.filter((d) => d.status !== 'resolved').length;
    const totalReturns = this.data.returns.length;

    // Suspicious products
    const flaggedListings = this.data.products.filter((p) => p.isSuspicious).length;

    return {
      totalGMV,
      totalOrders,
      completedOrders,
      totalSellers,
      totalCustomers,
      pendingVerifications,
      activeProducts,
      openDisputes,
      totalReturns,
      flaggedListings,
      platformFeeRevenue: Math.round(totalGMV * 0.05), // 5% marketplace commission
    };
  }
}

export const dbStore = new DatabaseStore();
