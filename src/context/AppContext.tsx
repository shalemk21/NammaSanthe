import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  RiderScreen,
  CustomerScreen,
  SellerScreen,
  AdminScreen,
  User,
  Shop,
  Category,
  Product,
  CartItem,
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
  FulfillmentType,
  Coupon,
} from '../types';
import { api } from '../services/api';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_VENDORS,
  INITIAL_ORDERS,
  INITIAL_SELLER_METRICS,
  WEEKLY_SALES_DATA,
  TOP_PRODUCTS,
  AVAILABLE_COUPONS,
} from '../data/mockData';

interface ToastNotification {
  id: string;
  message: string;
  kannadaMessage?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Auth & Roles
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  switchRole: (role: UserRole, demoEmail?: string) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;

  // Saved Addresses & Preferences (Phase 2)
  savedAddresses: SavedAddress[];
  selectedAddress: SavedAddress | null;
  setSelectedAddress: (addr: SavedAddress | null) => void;
  loadAddresses: () => Promise<void>;
  addSavedAddress: (addr: Omit<SavedAddress, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  deleteSavedAddress: (id: string) => Promise<boolean>;
  setDefaultSavedAddress: (id: string) => Promise<boolean>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<boolean>;

  // Navigation
  customerScreen: CustomerScreen;
  setCustomerScreen: (screen: CustomerScreen) => void;
  sellerScreen: SellerScreen;
  setSellerScreen: (screen: SellerScreen) => void;
  adminScreen: AdminScreen;
  setAdminScreen: (screen: AdminScreen) => void;
  riderScreen: RiderScreen;
  setRiderScreen: (screen: RiderScreen) => void;
  viewMode: 'mobile' | 'fullscreen';
  setViewMode: (mode: 'mobile' | 'fullscreen') => void;
  language: 'en' | 'kn';
  setLanguage: (lang: 'en' | 'kn') => void;

  // Hyperlocal Location & Filters
  selectedLocality: string;
  setSelectedLocality: (loc: string) => void;
  availableLocalities: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;

  // Data
  categories: Category[];
  shops: Shop[];
  products: Product[];
  orders: Order[];
  returns: ReturnRequest[];
  disputes: Dispute[];
  banners: PromotionalBanner[];
  notifications: NotificationItem[];
  unreadNotifCount: number;
  refreshData: () => Promise<void>;

  // Selection
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedShop: Shop | null;
  setSelectedShop: (shop: Shop | null) => void;
  selectedOrderForDetail: Order | null;
  setSelectedOrderForDetail: (order: Order | null) => void;
  selectedReturnForDetail: ReturnRequest | null;
  setSelectedReturnForDetail: (ret: ReturnRequest | null) => void;

  // Phase 2 Last Placed Order for Confirmation Screen
  lastPlacedOrder: Order | null;
  lastPlacedOrders: Order[];
  setLastPlacedOrder: (o: Order | null) => void;

  // Smart Comparison
  comparisonList: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isComparing: boolean;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Cart & Fulfillment (Phase 2 Delivery vs Pickup)
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartDiscount: number;
  cartEcoFee: number;
  cartFinalTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string; discount?: number };
  removeCoupon: () => void;
  availableCoupons: Coupon[];
  fulfillmentType: FulfillmentType;
  setFulfillmentType: (type: FulfillmentType) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  placeOrder: (details: {
    address?: string;
    slot?: string;
    pickupSlot?: string;
    fulfillmentType?: FulfillmentType;
    paymentMethod: string;
    locality?: string;
    pincode?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    couponCode?: string;
    couponDiscount?: number;
  }) => Promise<{ success: boolean; order?: Order; orders?: Order[]; message?: string }>;

  // Returns & Refunds
  submitReturnRequest: (data: {
    orderId: string;
    productId: string;
    reason: string;
    reasonDetails?: string;
    imageEvidence?: string;
  }) => Promise<boolean>;

  // Reviews Moderation (Phase 2)
  reportReview: (reviewId: string, reason: string) => Promise<boolean>;
  moderateReview: (reviewId: string, action: 'keep' | 'hide' | 'dismiss') => Promise<boolean>;

  // Phase 3 Invoice Modal
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  invoiceOrder: Order | null;
  openInvoiceModal: (order: Order) => void;
  closeInvoiceModal: () => void;

  // Phase 3 Customer Reviews with Photos
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  reviewTargetOrder: Order | null;
  reviewTargetProduct: Product | null;
  openReviewModal: (order: Order, product?: Product) => void;
  closeReviewModal: () => void;
  submitReviewWithPhotos: (
    dataOrProductId:
      | {
          orderId: string;
          productId: string;
          rating: number;
          comment: string;
          photos?: string[];
        }
      | string,
    rating?: number,
    comment?: string,
    photos?: string[],
    orderId?: string
  ) => Promise<boolean>;

  // Phase 3 Notifications Webhook Drawer
  isLiveNotifDrawerOpen: boolean;
  setIsLiveNotifDrawerOpen: (open: boolean) => void;
  openLiveNotifDrawer: () => void;
  closeLiveNotifDrawer: () => void;
  triggerWebhookNotification: (
    orderIdOrData:
      | string
      | {
          orderId: string;
          event: string;
          channel?: 'whatsapp' | 'sms' | 'both';
          type?: 'whatsapp' | 'sms';
          recipientPhone?: string;
          customNote?: string;
        },
    eventArg?: string,
    channelArg?: 'whatsapp' | 'sms' | 'both'
  ) => Promise<any>;

  // Phase 3 Rider Companion Actions
  updateRiderGps: (orderId: string, lat: number, lng: number, addressLabel?: string) => Promise<boolean>;
  verifyRiderHandover: (orderId: string, qrCode?: string, otp?: string) => Promise<{ success: boolean; message: string }>;
  collectRiderCash: (orderId: string, amount: number) => Promise<{ success: boolean; message: string }>;

  // Seller Dashboard
  sellerAnalytics: SellerAnalytics | null;
  loadSellerAnalytics: () => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  updateShop: (id: string, updates: Partial<Shop>) => Promise<void>;
  updateShopDeliverySettings: (shopId: string, settings: Partial<Shop>) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: string, note?: string, trackingReference?: string) => Promise<void>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  decideReturnRequest: (returnId: string, decision: 'approved' | 'rejected', notes?: string) => Promise<void>;
  progressReturnStatus: (returnId: string, status: string, note?: string) => Promise<void>;

  // Admin Dashboard
  adminStats: AdminStats | null;
  loadAdminStats: () => Promise<void>;
  verifySeller: (shopId: string, status: 'verified' | 'rejected' | 'suspended', notes?: string) => Promise<void>;
  flagListing: (productId: string, isSuspicious: boolean) => Promise<void>;
  resolveDispute: (disputeId: string, decision: string, status: 'resolved' | 'dismissed', action?: 'refund' | 'close') => Promise<void>;

  // UI Toast
  toast: ToastNotification | null;
  showToast: (message: string, type?: ToastNotification['type'], kannadaMessage?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AVAILABLE_LOCALITIES = [
  'Malleshwaram',
  'Indiranagar',
  'Devanahalli',
  'Koramangala',
  'HSR Layout',
  'Jayanagar',
  'Rajajinagar',
  'Whitefield',
  'Channapatna',
  'Mysuru Road',
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth & Roles
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'u-customer-1',
    name: 'Priya Sharma',
    email: 'customer@nammasanthe.com',
    role: 'customer',
    address: '#42, 4th Cross, Sampige Road',
    locality: 'Malleshwaram',
    city: 'Bengaluru',
    pincode: '560003',
    savedAddresses: [
      {
        id: 'addr-u-customer-1-1',
        userId: 'u-customer-1',
        label: 'Home',
        recipientName: 'Priya Sharma',
        phone: '+91 98450 99887',
        addressLine: '#42, 4th Cross, Sampige Road',
        locality: 'Malleshwaram',
        city: 'Bengaluru',
        pincode: '560003',
        landmark: 'Near 8th Cross Circle',
        isDefault: true,
        createdAt: '2026-10-01T10:00:00.000Z',
      },
      {
        id: 'addr-u-customer-1-2',
        userId: 'u-customer-1',
        label: 'Work',
        recipientName: 'Priya Sharma',
        phone: '+91 98450 99887',
        addressLine: 'Block B, Embassy Manyata Tech Park, Outer Ring Road',
        locality: 'Nagavara',
        city: 'Bengaluru',
        pincode: '560045',
        landmark: 'Near Gate 2',
        isDefault: false,
        createdAt: '2026-10-05T10:00:00.000Z',
      },
    ],
    notificationPreferences: {
      orderUpdates: true,
      deliveryAlerts: true,
      cancellationsAndRefunds: true,
      promotions: false,
      smsAlerts: true,
    },
  });
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(currentUser?.savedAddresses || []);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    currentUser?.savedAddresses?.find((a) => a.isDefault) || currentUser?.savedAddresses?.[0] || null
  );

  // Fulfillment Type (Delivery vs Pickup)
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');

  // Navigation
  const [customerScreen, setCustomerScreen] = useState<CustomerScreen>('home');
  const [sellerScreen, setSellerScreen] = useState<SellerScreen>('dashboard');
  const [adminScreen, setAdminScreen] = useState<AdminScreen>('dashboard');
  const [riderScreen, setRiderScreen] = useState<RiderScreen>('dashboard');
  const [viewMode, setViewMode] = useState<'mobile' | 'fullscreen'>('mobile');
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

  // Phase 3 Modals & Drawers
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetOrder, setReviewTargetOrder] = useState<Order | null>(null);
  const [reviewTargetProduct, setReviewTargetProduct] = useState<Product | null>(null);
  const [isLiveNotifDrawerOpen, setIsLiveNotifDrawerOpen] = useState(false);

  // Location & Filtering
  const [selectedLocality, setSelectedLocality] = useState<string>('Malleshwaram');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Entities Data
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [shops, setShops] = useState<Shop[]>(INITIAL_VENDORS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Selections
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedReturnForDetail, setSelectedReturnForDetail] = useState<ReturnRequest | null>(null);

  // Phase 2 Confirmation Screen
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [lastPlacedOrders, setLastPlacedOrders] = useState<Order[]>([]);

  // Features
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['p1', 'p4']);
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 2 },
    { product: INITIAL_PRODUCTS[1], quantity: 1 },
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(AVAILABLE_COUPONS[0]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Seller Dashboard
  const [sellerAnalytics, setSellerAnalytics] = useState<SellerAnalytics | null>(INITIAL_SELLER_METRICS);

  // Admin Dashboard
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastNotification['type'] = 'info', kannadaMessage?: string) => {
      const id = Date.now().toString();
      setToast({ id, message, kannadaMessage, type });
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 4000);
    },
    []
  );

  // Load Addresses without clobbering active selection
  const loadAddresses = useCallback(async () => {
    try {
      const res = await api.auth.getAddresses();
      if (res.success && res.addresses) {
        setSavedAddresses(res.addresses);
        setSelectedAddress((current) => {
          if (current && res.addresses.some((a) => a.id === current.id)) {
            return res.addresses.find((a) => a.id === current.id)!;
          }
          return res.addresses.find((a) => a.isDefault) || res.addresses[0] || null;
        });
      }
    } catch (err) {
      console.warn('Error loading addresses:', err);
    }
  }, []);

  const addSavedAddress = async (addr: Omit<SavedAddress, 'id' | 'userId' | 'createdAt'>): Promise<boolean> => {
    try {
      const res = await api.auth.addAddress(addr);
      if (res.success && res.address) {
        setSavedAddresses((prev) => [...prev, res.address]);
        // Instantly select the newly created address so it is immediately active in Checkout
        setSelectedAddress(res.address);
        if (res.address.locality) setSelectedLocality(res.address.locality);
        showToast('Address saved & selected!', 'success', 'ವಿಳಾಸವನ್ನು ಉಳಿಸಲಾಗಿದೆ ಮತ್ತು ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
      return false;
    }
  };

  const deleteSavedAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await api.auth.deleteAddress(id);
      if (res.success) {
        setSavedAddresses((prev) => {
          const next = prev.filter((a) => a.id !== id);
          setSelectedAddress((curr) => {
            if (curr?.id === id) {
              return next.find((a) => a.isDefault) || next[0] || null;
            }
            return curr;
          });
          return next;
        });
        showToast('Address removed', 'info', 'ವಿಳಾಸವನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete address', 'error');
      return false;
    }
  };

  const setDefaultSavedAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await api.auth.updateAddress(id, { isDefault: true });
      if (res.success) {
        setSavedAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
        const target = savedAddresses.find((a) => a.id === id);
        if (target) {
          setSelectedAddress({ ...target, isDefault: true });
          if (target.locality) setSelectedLocality(target.locality);
        }
        showToast('Default delivery address updated', 'success', 'ಡೀಫಾಲ್ಟ್ ವಿಳಾಸವನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to update default address', 'error');
      return false;
    }
  };

  const updateNotificationPreferences = async (
    prefs: Partial<NotificationPreferences>
  ): Promise<boolean> => {
    try {
      const res = await api.auth.updateNotificationPreferences(prefs);
      if (res.success) {
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            notificationPreferences: res.notificationPreferences,
          });
        }
        showToast('Preferences updated', 'success', 'ಆದ್ಯತೆಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to update preferences', 'error');
      return false;
    }
  };

  // Sync data from Backend API
  const refreshData = useCallback(async () => {
    try {
      const [shopsRes, prodsRes, catsRes] = await Promise.all([
        api.shops.getShops({ all: true }).catch(() => ({ success: false, shops: [] })),
        api.products.getProducts().catch(() => ({ success: false, products: [] })),
        api.products.getCategories().catch(() => ({ success: false, categories: [] })),
      ]);

      if (shopsRes.success && shopsRes.shops.length > 0) {
        setShops(shopsRes.shops);
      }
      if (prodsRes.success && prodsRes.products.length > 0) {
        setProducts(prodsRes.products);
      }
      if (catsRes.success && catsRes.categories.length > 0) {
        setCategories(catsRes.categories);
      }

      // Load authenticated user data
      let token = localStorage.getItem('nammasanthe_token');
      if (!token) {
        try {
          const loginRes = await api.auth.login('customer@nammasanthe.com', 'pass123');
          if (loginRes.success && loginRes.token) {
            token = loginRes.token;
            if (loginRes.user) setCurrentUser(loginRes.user);
          }
        } catch {
          // Token login fallback
        }
      }

      if (token) {
        try {
          const [ordersRes, returnsRes, notifsRes] = await Promise.all([
            api.orders.getOrders(),
            api.returns.getReturns(),
            api.notifications.getNotifications(),
          ]);
          if (ordersRes.success) setOrders(ordersRes.orders);
          if (returnsRes.success) setReturns(returnsRes.returns);
          if (notifsRes.success) {
            setNotifications(notifsRes.notifications);
            setUnreadNotifCount(notifsRes.unreadCount);
          }
          loadAddresses();
        } catch {
          // Token expired or server restarting
        }
      }
    } catch (err) {
      console.warn('API sync fallback to mock data:', err);
    }
  }, [loadAddresses]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-Time Order Status Synchronization
  // Polls every 10 seconds if any order is currently in an active fulfillment state
  useEffect(() => {
    const hasActiveOrders = orders.some((o) =>
      ['confirmed', 'processing', 'packed', 'shipped'].includes(o.status)
    );

    if (!hasActiveOrders) return;

    const intervalId = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [orders, refreshData]);

  // Role Switcher for instant pairing & demonstration
  const switchRole = async (newRole: UserRole, demoEmail?: string) => {
    setActiveRole(newRole);

    const emailMap: Record<UserRole, string> = {
      customer: 'customer@nammasanthe.com',
      seller: 'ravi@organicfarms.com',
      admin: 'admin@nammasanthe.com',
      rider: 'rider@nammasanthe.com',
    };
    const targetEmail = demoEmail || emailMap[newRole];
    const password = newRole === 'admin' ? 'admin123' : 'pass123';

    try {
      const res = await api.auth.login(targetEmail, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (res.user.savedAddresses && res.user.savedAddresses.length > 0) {
          setSavedAddresses(res.user.savedAddresses);
          setSelectedAddress(res.user.savedAddresses.find((a) => a.isDefault) || res.user.savedAddresses[0]);
        }
        showToast(
          `Switched to ${newRole.toUpperCase()} mode (${res.user.name})`,
          'success',
          `${newRole.toUpperCase()} ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ`
        );
      }
    } catch {
      // Mock fallback
      if (newRole === 'seller') {
        setCurrentUser({
          id: 'u-seller-1',
          name: 'Ravi Kumar Gowda',
          email: 'ravi@organicfarms.com',
          role: 'seller',
          shopId: 'v1',
        });
      } else if (newRole === 'admin') {
        setCurrentUser({
          id: 'u-admin-1',
          name: 'Santhe Admin Controller',
          email: 'admin@nammasanthe.com',
          role: 'admin',
        });
      } else if (newRole === 'rider') {
        setCurrentUser({
          id: 'u-rider-1',
          name: 'Basavaraju M (EV-Rider)',
          email: 'rider@nammasanthe.com',
          role: 'rider',
          riderVehicle: 'Ather 450X (KA-04-EK-9821)',
          riderPhone: '+91 98452 11099',
        });
      } else {
        setCurrentUser({
          id: 'u-customer-1',
          name: 'Priya Sharma',
          email: 'customer@nammasanthe.com',
          role: 'customer',
          address: '#42, 4th Cross, Sampige Road, Malleshwaram',
        });
      }
      showToast(`Active role: ${newRole.toUpperCase()}`, 'info');
    }

    if (newRole === 'customer') setCustomerScreen('home');
    else if (newRole === 'seller') setSellerScreen('dashboard');
    else if (newRole === 'admin') setAdminScreen('dashboard');
    else if (newRole === 'rider') setRiderScreen('dashboard');

    setTimeout(() => refreshData(), 200);
  };

  const logout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setActiveRole('customer');
    setCustomerScreen('home');
    showToast('Logged out successfully', 'info', 'ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ ಔಟ್ ಮಾಡಲಾಗಿದೆ');
  };

  // Cart Calculations
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // Delivery Fee is 0 for In-Store Pickup or above free delivery threshold
  const cartDeliveryFee =
    fulfillmentType === 'pickup'
      ? 0
      : cartSubtotal > 350 || cartSubtotal === 0
      ? 0
      : 35;

  // Coupon discount calculation logic
  const calculateCouponDiscount = (coupon: Coupon | null, subtotal: number, deliveryFee: number): number => {
    if (!coupon || subtotal <= 0) return 0;
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) return 0;

    if (coupon.code === 'NAMMAFREEDEL' || coupon.code === 'SANTHEFREE') {
      return deliveryFee;
    }

    if (coupon.discountType === 'percentage') {
      const raw = Math.round((subtotal * coupon.discountValue) / 100);
      return coupon.maxDiscount ? Math.min(coupon.maxDiscount, raw) : raw;
    }

    return Math.min(subtotal, coupon.discountValue);
  };

  const couponDiscountAmount = calculateCouponDiscount(appliedCoupon, cartSubtotal, cartDeliveryFee);
  const cartDiscount = appliedCoupon
    ? couponDiscountAmount
    : cartSubtotal > 500
    ? 50
    : 0;

  const cartEcoFee = fulfillmentType === 'pickup' || cartSubtotal === 0 ? 0 : 5;
  const cartFinalTotal = cartSubtotal > 0
    ? Math.max(0, cartSubtotal + cartDeliveryFee + cartEcoFee - cartDiscount)
    : 0;

  const applyCoupon = (code: string) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      showToast('Please enter a coupon code', 'warning', 'ದಯವಿಟ್ಟು ಕೂಪನ್ ಕೋಡ್ ನಮೂದಿಸಿ');
      return { success: false, message: 'Please enter a coupon code' };
    }

    const matched = AVAILABLE_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);
    if (!matched) {
      const msg = `Invalid promo coupon "${cleanCode}". Try SANTHE25, FARM50, HARVEST10, or NAMMAFREEDEL`;
      showToast(msg, 'warning', 'ಅಮಾನ್ಯ ಕೂಪನ್ ಕೋಡ್');
      return { success: false, message: msg };
    }

    if (matched.minOrderValue && cartSubtotal < matched.minOrderValue) {
      const msg = `Coupon ${matched.code} requires a minimum order of ₹${matched.minOrderValue}. Add ₹${matched.minOrderValue - cartSubtotal} more fresh produce.`;
      showToast(msg, 'warning', `ಕನಿಷ್ಠ ₹${matched.minOrderValue} ಮೌಲ್ಯದ ವಸ್ತುಗಳು ಬೇಕು`);
      return { success: false, message: msg };
    }

    setAppliedCoupon(matched);
    const savedAmount = calculateCouponDiscount(matched, cartSubtotal, cartDeliveryFee);
    const successMsg = `Coupon ${matched.code} applied! Saved ₹${savedAmount}`;
    showToast(successMsg, 'success', `ಕೂಪನ್ ${matched.code} ಅನ್ವಯಿಸಲಾಗಿದೆ! ₹${savedAmount} ಉಳಿಸಲಾಗಿದೆ`);
    return { success: true, message: successMsg, discount: savedAmount };
  };

  const removeCoupon = () => {
    if (appliedCoupon) {
      const removedCode = appliedCoupon.code;
      setAppliedCoupon(null);
      showToast(`Coupon ${removedCode} removed`, 'info', 'ಕೂಪನ್ ತೆಗೆದುಹಾಕಲಾಗಿದೆ');
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    showToast(
      `Added ${product.name} to cart`,
      'success',
      `${product.kannadaName || product.name} ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ`
    );
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    showToast('Item removed from cart', 'info', 'ವಸ್ತುವನ್ನು ಕಾರ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ');
  };

  const clearCart = () => setCart([]);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist!', 'success', 'ಮೆಚ್ಚಿನ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Comparison
  const addToComparison = (product: Product) => {
    if (comparisonList.some((p) => p.id === product.id)) {
      showToast('Product already in comparison', 'info');
      return;
    }
    if (comparisonList.length >= 4) {
      showToast('You can compare at most 4 products', 'warning');
      return;
    }
    setComparisonList((prev) => [...prev, product]);
    showToast(`Added to comparison (${comparisonList.length + 1}/4)`, 'success');
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => setComparisonList([]);

  // Phase 2 Place Order Checkout
  const placeOrder = async (details: {
    address?: string;
    slot?: string;
    pickupSlot?: string;
    fulfillmentType?: FulfillmentType;
    paymentMethod: string;
    locality?: string;
    pincode?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    couponCode?: string;
    couponDiscount?: number;
  }): Promise<{ success: boolean; order?: Order; orders?: Order[]; message?: string }> => {
    try {
      const mode = details.fulfillmentType || fulfillmentType;
      const isPickup = mode === 'pickup';

      const payload = {
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        fulfillmentType: mode,
        deliveryAddress: isPickup
          ? 'In-Store Pickup Counter'
          : details.address || selectedAddress?.addressLine || '#42, 4th Cross, Sampige Road',
        deliverySlot: details.slot || 'Today within 90 mins',
        pickupSlot: details.pickupSlot || 'Today, within 45-60 mins',
        paymentMethod: details.paymentMethod,
        deliveryLocality: details.locality || selectedAddress?.locality || selectedLocality,
        deliveryPincode: isPickup ? '560003' : details.pincode || selectedAddress?.pincode || '560003',
        couponCode: details.couponCode || appliedCoupon?.code,
        couponDiscount: details.couponDiscount !== undefined ? details.couponDiscount : cartDiscount,
        razorpay_order_id: details.razorpay_order_id,
        razorpay_payment_id: details.razorpay_payment_id,
        razorpay_signature: details.razorpay_signature,
      };

      const res = await api.orders.createOrder(payload);
      if (res.success && res.order) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1B5E3B', '#F2B705', '#E76F51'],
        });

        clearCart();
        setIsCheckoutOpen(false);

        const newOrders = res.orders || [res.order];
        setLastPlacedOrder(res.order);
        setLastPlacedOrders(newOrders);
        setSelectedOrderForDetail(res.order);
        setOrders((prev) => [...newOrders, ...prev]);

        // Route customer to payment confirmation screen with newly placed order details
        setCustomerScreen('payment_confirmation');

        showToast(
          `Order #${res.order.id} confirmed!`,
          'success',
          `ಆರ್ಡರ್ #${res.order.id} ಯಶಸ್ವಿಯಾಗಿ ಇರಿಸಲಾಗಿದೆ!`
        );

        // Trigger automated WhatsApp confirmation webhook
        api.notifications.simulateWebhook({
          channel: 'whatsapp',
          orderId: res.order.id,
          recipientPhone: '+91 98450 99887',
          recipientName: 'Priya Sharma',
          event: 'Order Confirmed & Payment Verified',
        }).catch(() => {});

        refreshData();
        return { success: true, order: res.order, orders: newOrders };
      }
      return { success: false, message: 'Could not create order' };
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
      return { success: false, message: err.message || 'Checkout failed' };
    }
  };

  // Submit Return Request
  const submitReturnRequest = async (data: {
    orderId: string;
    productId: string;
    reason: string;
    reasonDetails?: string;
    imageEvidence?: string;
  }): Promise<boolean> => {
    try {
      const res = await api.returns.createReturn(data);
      if (res.success && res.returnRequest) {
        setReturns((prev) => [res.returnRequest, ...prev]);
        showToast(
          `Return request #${res.returnRequest.id} submitted for review`,
          'success',
          'ರಿಟರ್ನ್ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ'
        );
        refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to submit return request', 'error');
      return false;
    }
  };

  // Reviews Moderation & Reporting
  const reportReview = async (reviewId: string, reason: string): Promise<boolean> => {
    try {
      const res = await api.reviews.reportReview(reviewId, reason);
      if (res.success) {
        showToast('Review reported for administrative moderation', 'info');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to report review', 'error');
      return false;
    }
  };

  const moderateReview = async (reviewId: string, action: 'keep' | 'hide' | 'dismiss'): Promise<boolean> => {
    try {
      const res = await api.admin.moderateReview(reviewId, action);
      if (res.success) {
        showToast(`Review action "${action}" completed`, 'success');
        refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Moderation action failed', 'error');
      return false;
    }
  };

  // Phase 3 Invoice Modal Handlers
  const openInvoiceModal = (order: Order) => {
    setInvoiceOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setInvoiceOrder(null);
  };

  // Phase 3 Reviews Handlers
  const openReviewModal = (order: Order, product?: Product) => {
    setReviewTargetOrder(order);
    setReviewTargetProduct(product || null);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewTargetOrder(null);
    setReviewTargetProduct(null);
  };

  const submitReviewWithPhotos = async (
    dataOrProductId:
      | {
          orderId: string;
          productId: string;
          rating: number;
          comment: string;
          photos?: string[];
        }
      | string,
    ratingArg?: number,
    commentArg?: string,
    photosArg?: string[],
    orderIdArg?: string
  ): Promise<boolean> => {
    try {
      const payload =
        typeof dataOrProductId === 'string'
          ? {
              orderId: orderIdArg || '',
              productId: dataOrProductId,
              rating: ratingArg || 5,
              comment: commentArg || '',
              photos: photosArg || [],
            }
          : dataOrProductId;

      const res = await api.reviews.createReview(payload);
      if (res.success) {
        showToast('Produce review submitted! Thank you.', 'success', 'ವಿಮರ್ಶೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!');
        refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
      return false;
    }
  };

  // Phase 3 Notifications Webhook Drawer Handlers
  const openLiveNotifDrawer = () => setIsLiveNotifDrawerOpen(true);
  const closeLiveNotifDrawer = () => setIsLiveNotifDrawerOpen(false);

  const triggerWebhookNotification = async (
    orderIdOrData:
      | string
      | {
          orderId: string;
          event: string;
          channel?: 'whatsapp' | 'sms' | 'both';
          type?: 'whatsapp' | 'sms';
          recipientPhone?: string;
          customNote?: string;
        },
    eventArg?: string,
    channelArg?: 'whatsapp' | 'sms' | 'both'
  ) => {
    try {
      const payload: any =
        typeof orderIdOrData === 'string'
          ? {
              orderId: orderIdOrData,
              event: eventArg || 'Status Update',
              channel: channelArg || 'both',
              recipientPhone: '+91 98450 99887',
            }
          : {
              orderId: orderIdOrData.orderId,
              event: orderIdOrData.event,
              channel: orderIdOrData.channel || (orderIdOrData.type === 'sms' ? 'sms' : 'whatsapp'),
              recipientPhone: orderIdOrData.recipientPhone || '+91 98450 99887',
            };

      const res = await api.notifications.simulateWebhook(payload);
      if (res.success) {
        const phone = res.notifications?.[0]?.recipientPhone || '+91 98450 99887';
        showToast(
          `Notification alert sent to ${phone}!`,
          'success',
          `ಸಂದೇಶ ರವಾನೆಯಾಗಿದೆ!`
        );
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'Notification webhook failed', 'error');
      return { success: false, message: err.message };
    }
  };

  // Phase 3 Rider Companion Handlers
  const updateRiderGps = async (
    orderId: string,
    lat: number,
    lng: number,
    addressLabel?: string
  ): Promise<boolean> => {
    try {
      const res = await api.orders.updateRiderGps(orderId, {
        latitude: lat,
        longitude: lng,
        addressLabel,
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  riderCoordinates: {
                    latitude: lat,
                    longitude: lng,
                    lat,
                    lng,
                    addressLabel,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : o
          )
        );
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to update GPS:', err);
      return false;
    }
  };

  const verifyRiderHandover = async (orderId: string, qrCode?: string, otp?: string) => {
    try {
      const res = await api.orders.verifyHandover(orderId, { qrToken: qrCode, deliveryOtp: otp });
      if (res.success) {
        showToast('Delivery verified successfully!', 'success', 'ವಿತರಣೆ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ!');
        refreshData();
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const collectRiderCash = async (orderId: string, amount: number) => {
    try {
      const res = await api.orders.collectCash(orderId, { amountCollected: amount });
      if (res.success) {
        showToast(`₹${amount} Cash Collected! Order Delivered.`, 'success', `₹${amount} ನಗದು ಸಂಗ್ರಹಿಸಲಾಗಿದೆ!`);
        refreshData();
      }
      return res;
    } catch (err: any) {
      showToast(err.message || 'Cash collection failed', 'error');
      return { success: false, message: err.message };
    }
  };

  // Seller Methods
  const loadSellerAnalytics = async () => {
    try {
      const shopId = currentUser?.shopId || 'v1';
      const res = await api.seller.getAnalytics(shopId);
      if (res.success) {
        setSellerAnalytics(res.metrics);
      }
    } catch (err) {
      console.warn('Error loading seller analytics:', err);
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const res = await api.seller.updateStock(productId, newStock);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stockCount: newStock, inStock: newStock > 0 } : p))
        );
        showToast(`Stock updated to ${newStock} units`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Stock update failed', 'error');
    }
  };

  const updateShop = async (id: string, updates: Partial<Shop>) => {
    try {
      const res = await api.shops.updateShop(id, updates);
      if (res.success) {
        setShops((prev) => prev.map((s) => (s.id === id ? res.shop : s)));
        if (selectedShop?.id === id) {
          setSelectedShop(res.shop);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update shop', 'error');
    }
  };

  const updateShopDeliverySettings = async (shopId: string, settings: Partial<Shop>): Promise<boolean> => {
    try {
      const res = await api.shops.updateShop(shopId, settings);
      if (res.success) {
        setShops((prev) => prev.map((s) => (s.id === shopId ? res.shop : s)));
        showToast('Delivery and PIN code settings saved!', 'success', 'ವಿತರಣಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Failed to save delivery settings', 'error');
      return false;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    note?: string,
    trackingReference?: string
  ) => {
    try {
      const res = await api.orders.updateOrderStatus(orderId, status, note, undefined, trackingReference);
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
        if (selectedOrderForDetail?.id === orderId) {
          setSelectedOrderForDetail(res.order);
        }
        showToast(`Order #${orderId} marked as ${status.replace('_', ' ').toUpperCase()}`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      const res = await api.orders.cancelOrder(orderId, reason);
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
        if (selectedOrderForDetail?.id === orderId) {
          setSelectedOrderForDetail(res.order);
        }
        showToast(`Order #${orderId} cancelled. Inventory restored.`, 'info');
        refreshData();
      }
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    }
  };

  const decideReturnRequest = async (returnId: string, decision: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await api.returns.decideReturn(returnId, decision, notes);
      if (res.success) {
        setReturns((prev) => prev.map((r) => (r.id === returnId ? res.returnRequest : r)));
        showToast(`Return request was ${decision}`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Decision failed', 'error');
    }
  };

  const progressReturnStatus = async (returnId: string, status: string, note?: string) => {
    try {
      const res = await api.returns.updateReturnStatus(returnId, status, note);
      if (res.success) {
        setReturns((prev) => prev.map((r) => (r.id === returnId ? res.returnRequest : r)));
        showToast(`Return status updated to ${status.replace('_', ' ')}`, 'success');
        refreshData();
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  // Admin Methods
  const loadAdminStats = async () => {
    try {
      const [statsRes, disputesRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getDisputes(),
      ]);
      if (statsRes.success) setAdminStats(statsRes.stats);
      if (disputesRes.success) setDisputes(disputesRes.disputes);
    } catch (err) {
      console.warn('Error loading admin stats:', err);
    }
  };

  const verifySeller = async (shopId: string, status: 'verified' | 'rejected' | 'suspended', notes?: string) => {
    try {
      const res = await api.admin.verifySeller(shopId, status, notes);
      if (res.success) {
        setShops((prev) => prev.map((s) => (s.id === shopId ? res.shop : s)));
        showToast(`Store verification set to ${status.toUpperCase()}`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Verification update failed', 'error');
    }
  };

  const flagListing = async (productId: string, isSuspicious: boolean) => {
    try {
      const res = await api.admin.flagListing(productId, isSuspicious);
      if (res.success) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? res.product : p)));
        showToast(
          isSuspicious ? 'Product flagged as suspicious' : 'Product unflagged',
          isSuspicious ? 'warning' : 'success'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Listing moderation failed', 'error');
    }
  };

  const resolveDispute = async (
    disputeId: string,
    decision: string,
    status: 'resolved' | 'dismissed',
    action?: 'refund' | 'close'
  ) => {
    try {
      const res = await api.admin.resolveDispute(disputeId, decision, status, action);
      if (res.success) {
        setDisputes((prev) => prev.map((d) => (d.id === disputeId ? res.dispute : d)));
        showToast(`Dispute #${disputeId} marked as ${status.toUpperCase()}`, 'success');
        refreshData();
      }
    } catch (err: any) {
      showToast(err.message || 'Dispute resolution failed', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRole,
        setActiveRole,
        switchRole,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        savedAddresses,
        selectedAddress,
        setSelectedAddress,
        loadAddresses,
        addSavedAddress,
        deleteSavedAddress,
        setDefaultSavedAddress,
        updateNotificationPreferences,
        customerScreen,
        setCustomerScreen,
        sellerScreen,
        setSellerScreen,
        adminScreen,
        setAdminScreen,
        viewMode,
        setViewMode,
        language,
        setLanguage,
        selectedLocality,
        setSelectedLocality,
        availableLocalities: AVAILABLE_LOCALITIES,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        categories,
        shops,
        products,
        orders,
        returns,
        disputes,
        banners,
        notifications,
        unreadNotifCount,
        refreshData,
        selectedProduct,
        setSelectedProduct,
        selectedShop,
        setSelectedShop,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        selectedReturnForDetail,
        setSelectedReturnForDetail,
        lastPlacedOrder,
        lastPlacedOrders,
        setLastPlacedOrder,
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isComparing: comparisonList.length > 0,
        wishlist,
        toggleWishlist,
        isInWishlist,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        cartDeliveryFee,
        cartDiscount,
        cartEcoFee,
        cartFinalTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        availableCoupons: AVAILABLE_COUPONS,
        fulfillmentType,
        setFulfillmentType,
        isCheckoutOpen,
        setIsCheckoutOpen,
        placeOrder,
        submitReturnRequest,
        reportReview,
        moderateReview,
        sellerAnalytics,
        loadSellerAnalytics,
        updateProductStock,
        updateShop,
        updateShopDeliverySettings,
        updateOrderStatus,
        cancelOrder,
        decideReturnRequest,
        progressReturnStatus,
        adminStats,
        loadAdminStats,
        verifySeller,
        flagListing,
        resolveDispute,
        toast,
        showToast,
        // Phase 3
        riderScreen,
        setRiderScreen,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        invoiceOrder,
        openInvoiceModal,
        closeInvoiceModal,
        isReviewModalOpen,
        setIsReviewModalOpen,
        reviewTargetOrder,
        reviewTargetProduct,
        openReviewModal,
        closeReviewModal,
        submitReviewWithPhotos,
        isLiveNotifDrawerOpen,
        setIsLiveNotifDrawerOpen,
        openLiveNotifDrawer,
        closeLiveNotifDrawer,
        triggerWebhookNotification,
        updateRiderGps,
        verifyRiderHandover,
        collectRiderCash,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
