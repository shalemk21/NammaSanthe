import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
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

  // Navigation
  customerScreen: CustomerScreen;
  setCustomerScreen: (screen: CustomerScreen) => void;
  sellerScreen: SellerScreen;
  setSellerScreen: (screen: SellerScreen) => void;
  adminScreen: AdminScreen;
  setAdminScreen: (screen: AdminScreen) => void;
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

  // Cart & Checkout
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
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  placeOrder: (details: {
    address: string;
    slot: string;
    paymentMethod: string;
    locality?: string;
    pincode?: string;
  }) => Promise<Order | null>;

  // Returns & Refunds
  submitReturnRequest: (data: {
    orderId: string;
    productId: string;
    reason: string;
    reasonDetails?: string;
    imageEvidence?: string;
  }) => Promise<boolean>;

  // Seller Dashboard
  sellerAnalytics: SellerAnalytics | null;
  loadSellerAnalytics: () => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  updateShop: (id: string, updates: Partial<Shop>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string, note?: string) => Promise<void>;
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
    phone: '+91 98450 99887',
    address: '#42, 4th Cross, Sampige Road',
    locality: 'Malleshwaram',
    city: 'Bengaluru',
    pincode: '560003',
  });
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Navigation
  const [customerScreen, setCustomerScreen] = useState<CustomerScreen>('home');
  const [sellerScreen, setSellerScreen] = useState<SellerScreen>('dashboard');
  const [adminScreen, setAdminScreen] = useState<AdminScreen>('dashboard');
  const [viewMode, setViewMode] = useState<'mobile' | 'fullscreen'>('fullscreen');
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

  // Hyperlocal Location & Filters
  const [selectedLocality, setSelectedLocality] = useState<string>('Malleshwaram');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Core Data
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [shops, setShops] = useState<Shop[]>(INITIAL_VENDORS as any);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS as any);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Selected Entities
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedReturnForDetail, setSelectedReturnForDetail] = useState<ReturnRequest | null>(null);

  // Comparison & Wishlist
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['p1', 'p6']);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 2 },
    { product: INITIAL_PRODUCTS[1], quantity: 1 },
  ]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Analytics
  const [sellerAnalytics, setSellerAnalytics] = useState<SellerAnalytics | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastNotification['type'] = 'success', kannadaMessage?: string) => {
      const id = Date.now().toString();
      setToast({ id, message, type, kannadaMessage });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 3500);
    },
    []
  );

  // Refresh all data from backend
  const refreshData = useCallback(async () => {
    try {
      // Products & Categories
      const [catsRes, prodsRes, shopsRes, notifsRes] = await Promise.all([
        api.products.getCategories().catch(() => ({ categories: INITIAL_CATEGORIES })),
        api.products.getProducts({ locality: selectedLocality }).catch(() => ({ products: INITIAL_PRODUCTS })),
        api.shops.getShops({ locality: selectedLocality, all: activeRole === 'admin' }).catch(() => ({ shops: INITIAL_VENDORS as any })),
        api.notifications.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
      ]);

      if (catsRes?.categories) setCategories(catsRes.categories);
      if (prodsRes?.products) setProducts(prodsRes.products);
      if (shopsRes?.shops) setShops(shopsRes.shops);
      if (notifsRes?.notifications) {
        setNotifications(notifsRes.notifications);
        setUnreadNotifCount(notifsRes.unreadCount || 0);
      }

      // Orders & Returns (if authenticated)
      if (localStorage.getItem('nammasanthe_token')) {
        const [ordersRes, returnsRes] = await Promise.all([
          api.orders.getOrders().catch(() => ({ orders: [] })),
          api.returns.getReturns().catch(() => ({ returns: [] })),
        ]);
        if (ordersRes?.orders) setOrders(ordersRes.orders);
        if (returnsRes?.returns) setReturns(returnsRes.returns);
      }
    } catch (err) {
      console.warn('Backend sync failed, using current cache:', err);
    }
  }, [selectedLocality, activeRole]);

  // Initial load
  useEffect(() => {
    // Attempt auto-login if token exists
    const token = localStorage.getItem('nammasanthe_token');
    if (token) {
      api.auth
        .getMe()
        .then((res) => {
          if (res.user) {
            setCurrentUser(res.user);
            setActiveRole(res.user.role);
          }
        })
        .catch(() => {
          // Fallback to default customer
        });
    }
    refreshData();
  }, [refreshData]);

  // Switch Role / Demo Switcher
  const switchRole = async (newRole: UserRole, demoEmail?: string) => {
    let targetEmail = demoEmail;
    if (!targetEmail) {
      if (newRole === 'customer') targetEmail = 'customer@nammasanthe.com';
      else if (newRole === 'seller') targetEmail = 'ravi@organicfarms.com';
      else if (newRole === 'admin') targetEmail = 'admin@nammasanthe.com';
    }

    const password = newRole === 'admin' ? 'admin123' : 'pass123';

    try {
      if (targetEmail) {
        const res = await api.auth.login(targetEmail, password);
        if (res.user) {
          setCurrentUser(res.user);
          setActiveRole(res.user.role);
          showToast(
            `Switched to ${res.user.role.toUpperCase()} mode: ${res.user.name}`,
            'success',
            `${res.user.name} ಖಾತೆಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ`
          );
        }
      } else {
        setActiveRole(newRole);
      }
    } catch {
      // In-memory fallback if backend is momentarily restarting
      setActiveRole(newRole);
      if (newRole === 'seller') {
        setCurrentUser({
          id: 'u-seller-1',
          name: 'Ravi Organic Farms',
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

    // Adjust screen accordingly
    if (newRole === 'customer') setCustomerScreen('home');
    else if (newRole === 'seller') setSellerScreen('dashboard');
    else if (newRole === 'admin') setAdminScreen('dashboard');

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
  const cartDeliveryFee = cartSubtotal > 300 || cartSubtotal === 0 ? 0 : 35;
  const cartDiscount = cartSubtotal > 500 ? 50 : 0;
  const cartEcoFee = cartSubtotal > 0 ? 5 : 0;
  const cartFinalTotal = cartSubtotal > 0 ? cartSubtotal + cartDeliveryFee + cartEcoFee - cartDiscount : 0;

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

  // Place Order Checkout
  const placeOrder = async (details: {
    address: string;
    slot: string;
    paymentMethod: string;
    locality?: string;
    pincode?: string;
  }): Promise<Order | null> => {
    try {
      const payload = {
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryAddress: details.address,
        deliverySlot: details.slot,
        paymentMethod: details.paymentMethod,
        deliveryLocality: details.locality || selectedLocality,
        deliveryPincode: details.pincode || '560003',
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
        setSelectedOrderForDetail(res.order);
        setOrders((prev) => [res.order, ...prev]);
        setCustomerScreen('order_tracking');

        showToast(
          `Order #${res.order.id} placed successfully!`,
          'success',
          `ಆರ್ಡರ್ #${res.order.id} ಯಶಸ್ವಿಯಾಗಿ ಇರಿಸಲಾಗಿದೆ!`
        );

        // Refresh inventory to reflect decremented stock
        refreshData();
        return res.order;
      }
      return null;
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
      return null;
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

  const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
    try {
      const res = await api.orders.updateOrderStatus(orderId, status, note);
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
        if (selectedOrderForDetail?.id === orderId) {
          setSelectedOrderForDetail(res.order);
        }
        showToast(`Order #${orderId} marked as ${status.toUpperCase()}`, 'success');
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
        showToast(`Return status updated to ${status}`, 'success');
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
        isCheckoutOpen,
        setIsCheckoutOpen,
        placeOrder,
        submitReturnRequest,
        sellerAnalytics,
        loadSellerAnalytics,
        updateProductStock,
        updateShop,
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
