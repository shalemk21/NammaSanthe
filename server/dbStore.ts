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
  SavedAddress,
  PaymentTransaction,
  RefundTransaction,
  AuditLog,
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
  paymentTransactions: PaymentTransaction[];
  refundTransactions: RefundTransaction[];
  auditLogs: AuditLog[];
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
      paymentTransactions: [],
      refundTransactions: [],
      auditLogs: [],
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
        // Ensure any new seed user (e.g. u-rider-1) is added if missing
        for (const su of SEED_USERS) {
          if (!this.data.users.some((u) => u.id === su.id || u.email === su.email)) {
            this.data.users.push(su);
          }
        }
        this.data.shops = this.data.shops || [...SEED_SHOPS];
        this.data.categories = this.data.categories || [...SEED_CATEGORIES];
        this.data.products = this.data.products || [...SEED_PRODUCTS];
        this.data.orders = this.data.orders || [...SEED_ORDERS];
        this.data.returns = this.data.returns || [...SEED_RETURNS];
        this.data.disputes = this.data.disputes || [...SEED_DISPUTES];
        this.data.reviews = this.data.reviews || [...SEED_REVIEWS];
        this.data.notifications = this.data.notifications || [...SEED_NOTIFICATIONS];
        this.data.banners = this.data.banners || [...SEED_BANNERS];
        this.data.paymentTransactions = this.data.paymentTransactions || [];
        this.data.refundTransactions = this.data.refundTransactions || [];
        this.data.auditLogs = this.data.auditLogs || [];
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
          paymentTransactions: [],
          refundTransactions: [],
          auditLogs: [],
        };
      }

      // Backfill Phase 2 delivery configuration on existing shops
      const defaultPincodes = ['560003', '560055', '560010', '560001', '560012', '562110'];
      this.data.shops.forEach((s) => {
        if (!s.serviceablePincodes || s.serviceablePincodes.length === 0) {
          if (s.id === 'v1') s.serviceablePincodes = ['560003', '560055', '560012', '560064', '562110', '560024', '560092'];
          else if (s.id === 'v2') s.serviceablePincodes = ['560003', '560010', '560055', '560080', '560021'];
          else if (s.id === 'v3') s.serviceablePincodes = ['560001', '560002', '560003', '560004', '560011', '560025', '560038', '562160'];
          else if (s.id === 'v4') s.serviceablePincodes = ['560003', '560026', '560040', '560004', '560019', '560070'];
          else s.serviceablePincodes = [...defaultPincodes];
        }
        if (s.minOrderValue === undefined) s.minOrderValue = 99;
        if (s.deliveryCharge === undefined) s.deliveryCharge = 35;
        if (s.freeDeliveryThreshold === undefined) s.freeDeliveryThreshold = 350;
        if (s.estimatedPrepTimeMinutes === undefined) s.estimatedPrepTimeMinutes = 30;
        if (s.allowPickup === undefined) s.allowPickup = true;
        if (s.allowCod === undefined) s.allowCod = true;
        if (s.deliveryPartnerType === undefined) s.deliveryPartnerType = 'self';
      });

      // Backfill Phase 2 SavedAddresses & notificationPreferences on users
      this.data.users.forEach((u) => {
        if (!u.savedAddresses || u.savedAddresses.length === 0) {
          u.savedAddresses = [
            {
              id: `addr-${u.id}-1`,
              userId: u.id,
              label: 'Home',
              recipientName: u.name,
              phone: u.phone || '+91 98450 99887',
              addressLine: u.address || '#42, 4th Cross, Sampige Road',
              locality: u.locality || 'Malleshwaram',
              city: u.city || 'Bengaluru',
              pincode: u.pincode || '560003',
              landmark: 'Near 8th Cross Circle',
              isDefault: true,
              createdAt: '2026-10-01T10:00:00.000Z',
            },
            {
              id: `addr-${u.id}-2`,
              userId: u.id,
              label: 'Work',
              recipientName: u.name,
              phone: u.phone || '+91 98450 99887',
              addressLine: 'Block B, Embassy Manyata Tech Park, Outer Ring Road',
              locality: 'Nagavara',
              city: 'Bengaluru',
              pincode: '560045',
              landmark: 'Near Gate 2',
              isDefault: false,
              createdAt: '2026-10-05T10:00:00.000Z',
            },
          ];
        }
        if (!u.notificationPreferences) {
          u.notificationPreferences = {
            orderUpdates: true,
            deliveryAlerts: true,
            cancellationsAndRefunds: true,
            promotions: false,
            smsAlerts: true,
          };
        }
      });

      // Backfill Phase 2 order fields
      this.data.orders.forEach((o) => {
        if (!o.fulfillmentType) o.fulfillmentType = 'delivery';
        if (!o.refundStatus) o.refundStatus = 'none';
        if (!o.paymentStatus) o.paymentStatus = 'paid';
      });

      // Backfill review fields
      this.data.reviews.forEach((r) => {
        if (!r.status) r.status = 'active';
      });

      this.save();
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
        paymentTransactions: [],
        refundTransactions: [],
        auditLogs: [],
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

  // --- USERS & ADDRESSES ---
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

  getUserAddresses(userId: string): SavedAddress[] {
    const user = this.getUserById(userId);
    return user?.savedAddresses || [];
  }

  addSavedAddress(
    userId: string,
    address: Omit<SavedAddress, 'id' | 'userId' | 'createdAt'>
  ): SavedAddress | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.savedAddresses = user.savedAddresses || [];
    if (address.isDefault) {
      user.savedAddresses.forEach((a) => (a.isDefault = false));
    } else if (user.savedAddresses.length === 0) {
      address.isDefault = true;
    }

    const newAddr: SavedAddress = {
      ...address,
      id: `addr-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
    };

    user.savedAddresses.push(newAddr);
    this.save();
    return newAddr;
  }

  updateSavedAddress(
    userId: string,
    addressId: string,
    updates: Partial<SavedAddress>
  ): SavedAddress | undefined {
    const user = this.getUserById(userId);
    if (!user || !user.savedAddresses) return undefined;

    const idx = user.savedAddresses.findIndex((a) => a.id === addressId);
    if (idx === -1) return undefined;

    if (updates.isDefault) {
      user.savedAddresses.forEach((a) => (a.isDefault = false));
    }

    user.savedAddresses[idx] = { ...user.savedAddresses[idx], ...updates };
    this.save();
    return user.savedAddresses[idx];
  }

  deleteSavedAddress(userId: string, addressId: string): boolean {
    const user = this.getUserById(userId);
    if (!user || !user.savedAddresses) return false;

    const idx = user.savedAddresses.findIndex((a) => a.id === addressId);
    if (idx === -1) return false;

    const wasDefault = user.savedAddresses[idx].isDefault;
    user.savedAddresses.splice(idx, 1);
    if (wasDefault && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true;
    }
    this.save();
    return true;
  }

  // --- SHOPS & SERVICEABILITY ---
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

  isPincodeServiceable(shopId: string, pincode: string): boolean {
    const shop = this.getShopById(shopId);
    if (!shop) return false;
    if (!shop.serviceablePincodes || shop.serviceablePincodes.length === 0) return true;
    return shop.serviceablePincodes.includes(pincode.trim());
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
    if (p.reservedCount && p.reservedCount >= quantity) {
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

  getOrdersByParentId(parentId: string): Order[] {
    return this.data.orders.filter((o) => o.parentOrderId === parentId || o.id === parentId);
  }

  createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
    this.save();
    return this.data.orders[idx];
  }

  updateOrderStatus(
    id: string,
    status: Order['status'],
    stepDescription?: string,
    kannadaStepDescription?: string,
    trackingReference?: string
  ): Order | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;
    order.status = status;
    if (trackingReference) {
      order.trackingReference = trackingReference;
    }

    // If delivered or picked up, auto mark payment paid if COD
    if ((status === 'delivered' || status === 'picked_up') && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const stepNameMap: Record<string, { en: string; kn: string }> = {
      confirmed: { en: 'Order Confirmed', kn: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
      processing: { en: 'Preparing Order', kn: 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ' },
      packed: { en: 'Packed at Local Store', kn: 'ಪ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ' },
      ready_for_pickup: { en: 'Ready for Store Pickup', kn: 'ಅಂಗಡಿಯಲ್ಲಿ ಪಡೆಯಲು ಸಿದ್ಧವಾಗಿದೆ' },
      shipped: { en: 'Out for Local Delivery', kn: 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ' },
      delivered: { en: 'Delivered Successfully', kn: 'ತಲುಪಿಸಲಾಗಿದೆ' },
      picked_up: { en: 'Picked Up by Customer', kn: 'ಗ್ರಾಹಕರು ಪಡೆದುಕೊಂಡಿದ್ದಾರೆ' },
      cancelled: { en: 'Order Cancelled', kn: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ' },
    };

    const info = stepNameMap[status] || { en: status, kn: status };

    const newStep = {
      step: info.en,
      kannadaStep: info.kn,
      time: timeStr,
      completed: true,
      current: status !== 'delivered' && status !== 'picked_up' && status !== 'cancelled',
      description:
        stepDescription ||
        (trackingReference
          ? `Status updated to ${status}. Courier Tracking Ref: ${trackingReference}`
          : `Status changed to ${status}`),
    };

    order.trackingSteps = order.trackingSteps.map((s) => ({ ...s, current: false }));
    order.trackingSteps.push(newStep);

    this.save();
    return order;
  }

  cancelOrder(id: string, reason: string, cancelledBy = 'Customer'): Order | undefined {
    const order = this.getOrderById(id);
    if (!order) return undefined;
    if (
      order.status === 'delivered' ||
      order.status === 'picked_up' ||
      order.status === 'cancelled'
    ) {
      return undefined; // Already terminal
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledBy = cancelledBy;
    order.cancelledAt = new Date().toISOString();

    // Restore stock for all items
    for (const item of order.items) {
      this.restoreStock(item.productId, item.quantity);
    }

    // Trigger refund if order was paid (online/prepaid)
    let refundNote = 'No payment refund required (COD/unpaid).';
    if (order.paymentStatus === 'paid' && order.paymentMethod.toLowerCase().indexOf('cod') === -1) {
      order.paymentStatus = 'refunded';
      order.refundStatus = 'successful';
      order.refundAmount = order.totalAmount;
      order.refundTransactionId = `REFUND-CAN-${Date.now().toString().slice(-6)}`;
      refundNote = `Automatic full refund of ₹${order.totalAmount} initiated to original payment method (${order.paymentMethod}). Ref: ${order.refundTransactionId}.`;

      // Log refund transaction
      this.createRefundTransaction({
        id: `ref-tx-${Date.now()}`,
        orderId: order.id,
        amount: order.totalAmount,
        status: 'successful',
        reason: `Order cancelled by ${cancelledBy}: ${reason}`,
        initiatedBy: cancelledBy,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      });
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    order.trackingSteps.push({
      step: 'Order Cancelled',
      kannadaStep: 'ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
      time: timeStr,
      completed: true,
      current: true,
      description: `Cancelled: ${reason}. Inventory restored to seller. ${refundNote}`,
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

  // --- PAYMENT TRANSACTIONS ---
  getPaymentTransactions(): PaymentTransaction[] {
    return this.data.paymentTransactions;
  }

  getPaymentTransactionById(id: string): PaymentTransaction | undefined {
    return this.data.paymentTransactions.find((p) => p.id === id);
  }

  getPaymentTransactionByGatewayOrderId(gatewayOrderId: string): PaymentTransaction | undefined {
    return this.data.paymentTransactions.find((p) => p.gatewayOrderId === gatewayOrderId);
  }

  createPaymentTransaction(tx: PaymentTransaction): PaymentTransaction {
    this.data.paymentTransactions.unshift(tx);
    this.save();
    return tx;
  }

  updatePaymentTransaction(
    id: string,
    updates: Partial<PaymentTransaction>
  ): PaymentTransaction | undefined {
    const idx = this.data.paymentTransactions.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.paymentTransactions[idx] = { ...this.data.paymentTransactions[idx], ...updates };
    this.save();
    return this.data.paymentTransactions[idx];
  }

  // --- REFUND TRANSACTIONS ---
  getRefundTransactions(): RefundTransaction[] {
    return this.data.refundTransactions;
  }

  getRefundTransactionById(id: string): RefundTransaction | undefined {
    return this.data.refundTransactions.find((r) => r.id === id);
  }

  createRefundTransaction(ref: RefundTransaction): RefundTransaction {
    this.data.refundTransactions.unshift(ref);
    this.save();
    return ref;
  }

  updateRefundTransaction(
    id: string,
    updates: Partial<RefundTransaction>
  ): RefundTransaction | undefined {
    const idx = this.data.refundTransactions.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.data.refundTransactions[idx] = { ...this.data.refundTransactions[idx], ...updates };
    this.save();
    return this.data.refundTransactions[idx];
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

  // --- REVIEWS & MODERATION ---
  getReviews(): Review[] {
    return this.data.reviews;
  }

  getReviewById(id: string): Review | undefined {
    return this.data.reviews.find((r) => r.id === id);
  }

  createReview(review: Review): Review {
    review.status = 'active';
    this.data.reviews.unshift(review);

    this.recalculateRatings(review.productId, review.vendorId);
    this.save();
    return review;
  }

  updateReview(id: string, updates: Partial<Review>): Review | undefined {
    const idx = this.data.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.data.reviews[idx] = {
      ...this.data.reviews[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.recalculateRatings(this.data.reviews[idx].productId, this.data.reviews[idx].vendorId);
    this.save();
    return this.data.reviews[idx];
  }

  deleteReview(id: string): boolean {
    const idx = this.data.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    const rev = this.data.reviews[idx];
    this.data.reviews.splice(idx, 1);
    this.recalculateRatings(rev.productId, rev.vendorId);
    this.save();
    return true;
  }

  reportReview(reviewId: string, reason: string, reportedBy: string): Review | undefined {
    const rev = this.getReviewById(reviewId);
    if (!rev) return undefined;
    rev.status = 'reported';
    rev.reportReason = reason;
    rev.reportedBy = reportedBy;
    rev.reportedAt = new Date().toISOString();
    this.save();
    return rev;
  }

  moderateReview(reviewId: string, action: 'keep' | 'hide' | 'dismiss'): Review | undefined {
    const rev = this.getReviewById(reviewId);
    if (!rev) return undefined;
    if (action === 'hide') {
      rev.status = 'hidden';
    } else if (action === 'keep' || action === 'dismiss') {
      rev.status = 'active';
      rev.reportReason = undefined;
    }
    this.recalculateRatings(rev.productId, rev.vendorId);
    this.save();
    return rev;
  }

  private recalculateRatings(productId: string, vendorId: string) {
    // Only count active non-hidden reviews
    const prodReviews = this.data.reviews.filter(
      (r) => r.productId === productId && r.status !== 'hidden'
    );
    const avg =
      prodReviews.length > 0
        ? prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / prodReviews.length
        : 5.0;
    this.updateProduct(productId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: prodReviews.length,
    });

    const shopReviews = this.data.reviews.filter(
      (r) => r.vendorId === vendorId && r.status !== 'hidden'
    );
    if (shopReviews.length > 0) {
      const shopAvg =
        shopReviews.reduce((acc, curr) => acc + curr.rating, 0) / shopReviews.length;
      this.updateShop(vendorId, {
        rating: parseFloat(shopAvg.toFixed(1)),
        reviewsCount: shopReviews.length,
      });
    }
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

  // --- AUDIT LOGS ---
  createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // --- CALCULATED SELLER ANALYTICS ---
  getSellerAnalytics(vendorId: string) {
    const vendorOrders = this.data.orders.filter((o) => o.vendorId === vendorId);
    const completedOrders = vendorOrders.filter(
      (o) => o.status === 'delivered' || o.status === 'picked_up'
    );
    const cancelledOrders = vendorOrders.filter((o) => o.status === 'cancelled');

    const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const activeProducts = this.data.products.filter((p) => p.vendorId === vendorId);
    const lowStockProducts = activeProducts.filter((p) => p.stockCount <= 10);

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
    const completedOrders = this.data.orders.filter(
      (o) => o.status === 'delivered' || o.status === 'picked_up'
    ).length;
    const pendingVerifications = this.data.shops.filter(
      (s) => s.verificationStatus === 'pending'
    ).length;
    const totalSellers = this.data.shops.length;
    const activeProducts = this.data.products.length;
    const totalCustomers = this.data.users.filter((u) => u.role === 'customer').length;
    const openDisputes = this.data.disputes.filter((d) => d.status !== 'resolved').length;
    const totalReturns = this.data.returns.length;
    const flaggedListings = this.data.products.filter((p) => p.isSuspicious).length;
    const pendingRefundsCount = this.data.returns.filter(
      (r) => r.status === 'refund_processing' || r.refundStatus === 'processing'
    ).length;
    const reportedReviewsCount = this.data.reviews.filter((r) => r.status === 'reported').length;

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
      pendingRefundsCount,
      reportedReviewsCount,
      platformFeeRevenue: Math.round(totalGMV * 0.05),
    };
  }
}

export const dbStore = new DatabaseStore();
