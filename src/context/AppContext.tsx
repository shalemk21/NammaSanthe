import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  CustomerScreen,
  SellerScreen,
  Product,
  Vendor,
  Category,
  CartItem,
  Order,
  DailySalesData,
  TopProductPerformance,
} from '../types';
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
  type: 'success' | 'info' | 'warning';
}

interface AppContextType {
  // Roles and navigation
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  customerScreen: CustomerScreen;
  setCustomerScreen: (screen: CustomerScreen) => void;
  sellerScreen: SellerScreen;
  setSellerScreen: (screen: SellerScreen) => void;
  viewMode: 'mobile' | 'fullscreen';
  setViewMode: (mode: 'mobile' | 'fullscreen') => void;
  language: 'en' | 'kn';
  setLanguage: (lang: 'en' | 'kn') => void;

  // Location & Search
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;

  // Data
  categories: Category[];
  vendors: Vendor[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  selectedProduct: Product | null;
  selectedOrderForDetail: Order | null;
  setSelectedOrderForDetail: (order: Order | null) => void;

  // Seller specific
  sellerMetrics: typeof INITIAL_SELLER_METRICS;
  weeklySales: DailySalesData[];
  topProducts: TopProductPerformance[];
  isShopOpen: boolean;
  toggleShopOpen: () => void;

  // Actions
  viewProductDetail: (product: Product) => void;
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

  // Checkout & Orders
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  placeOrder: (details: {
    address: string;
    slot: string;
    paymentMethod: string;
  }) => void;
  acceptSellerOrder: (orderId: string) => void;
  declineSellerOrder: (orderId: string) => void;
  markOrderDelivered: (orderId: string) => void;

  // Product management (Seller)
  addNewProduct: (productData: Partial<Product>) => void;
  updateProductStock: (productId: string, newStock: number) => void;

  // Toast
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning', kannadaMessage?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [customerScreen, setCustomerScreen] = useState<CustomerScreen>('splash');
  const [sellerScreen, setSellerScreen] = useState<SellerScreen>('dashboard');
  const [viewMode, setViewMode] = useState<'mobile' | 'fullscreen'>('mobile');
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

  const [selectedLocation, setSelectedLocation] = useState<string>('Bengaluru (Malleshwaram)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [vendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 2 },
    { product: INITIAL_PRODUCTS[1], quantity: 1 },
  ]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(INITIAL_ORDERS[0]);

  const [sellerMetrics, setSellerMetrics] = useState(INITIAL_SELLER_METRICS);
  const [weeklySales] = useState<DailySalesData[]>(WEEKLY_SALES_DATA);
  const [topProducts] = useState<TopProductPerformance[]>(TOP_PRODUCTS);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(true);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'warning' = 'success',
    kannadaMessage?: string
  ) => {
    const id = Date.now().toString();
    setToast({ id, message, kannadaMessage, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Audio haptic feedback simulation
  const playHaptic = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed or not supported; gracefully fallback
    }
  };

  const viewProductDetail = (product: Product) => {
    playHaptic();
    setSelectedProduct(product);
    setCustomerScreen('detail');
  };

  const addToCart = (product: Product, quantity = 1) => {
    playHaptic();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast(
      `Added ${product.name} to Santhe Basket!`,
      'success',
      `${product.kannadaName} ಬುಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!`
    );
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    playHaptic();
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    playHaptic();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from basket', 'info', 'ಬುಟ್ಟಿಯಿಂದ ಐಟಂ ತೆಗೆಯಲಾಗಿದೆ');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart Calculations
  const cartTotalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );
  const cartDeliveryFee = cartSubtotal >= 299 || cartSubtotal === 0 ? 0 : 25;
  const cartDiscount = cartSubtotal > 350 ? 30 : 0;
  const cartEcoFee = cart.length > 0 ? 5 : 0;
  const cartFinalTotal = Math.max(0, cartSubtotal + cartDeliveryFee + cartEcoFee - cartDiscount);

  const placeOrder = (details: {
    address: string;
    slot: string;
    paymentMethod: string;
  }) => {
    playHaptic();
    const newOrderId = `NS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: newOrderId,
      createdAt: 'Just now',
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: cartDeliveryFee,
      discount: cartDiscount,
      ecoPackagingFee: cartEcoFee,
      totalAmount: cartFinalTotal,
      status: 'processing',
      deliveryAddress: details.address,
      deliverySlot: details.slot,
      paymentMethod: details.paymentMethod,
      estimatedDelivery: 'Within 35 - 45 mins',
      deliveryAgent: {
        name: 'Basavaraj K',
        phone: '+91 99801 44321',
        vehicle: 'Santhe E-Scooter (KA-01-ET-7182)',
      },
      trackingSteps: [
        {
          step: 'Order Confirmed',
          kannadaStep: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
          time: 'Just now',
          completed: true,
          current: false,
          description: 'Payment successful, vendor acknowledged order.',
        },
        {
          step: 'Packing Fresh at Store / Farm',
          kannadaStep: 'ತಾಜಾ ಪ್ಯಾಕಿಂಗ್ ಮಾಡಲಾಗುತ್ತಿದೆ',
          time: 'Est. 10 mins',
          completed: false,
          current: true,
          description: 'Gathering fresh produce & eco-packing in cloth bags.',
        },
        {
          step: 'Out for Local Delivery',
          kannadaStep: 'ವಿತರಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ',
          time: 'Est. 25 mins',
          completed: false,
          current: false,
          description: 'Hyperlocal rider will pick up from seller hub.',
        },
        {
          step: 'Delivered to Doorstep',
          kannadaStep: 'ಬಾಗಿಲಿಗೆ ತಲುಪಿಸಲಾಗಿದೆ',
          time: 'Est. 40 mins',
          completed: false,
          current: false,
          description: 'Enjoy farm-fresh produce with your family!',
        },
      ],
      vendorId: cart[0]?.product.vendorId || 'v1',
      vendorName: cart[0]?.product.vendorName || 'Lakshmi Stores & Mill',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderForDetail(newOrder);

    // Update Seller Metrics
    setSellerMetrics((prev) => ({
      ...prev,
      totalSales: prev.totalSales + cartFinalTotal,
      totalOrders: prev.totalOrders + 1,
    }));

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1B5E3B', '#F2B705', '#E76F51', '#885E3C'],
      });
    } catch {
      // Ignored
    }

    clearCart();
    setIsCheckoutOpen(false);
    setCustomerScreen('orders');
    showToast(
      `Order ${newOrderId} placed successfully!`,
      'success',
      `ಆರ್ಡರ್ ${newOrderId} ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!`
    );
  };

  const acceptSellerOrder = (orderId: string) => {
    playHaptic();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedSteps = order.trackingSteps.map((step, idx) => {
            if (idx === 1) return { ...step, completed: true, current: false };
            if (idx === 2) return { ...step, current: true };
            return step;
          });
          return {
            ...order,
            status: 'shipped',
            trackingSteps: updatedSteps,
          };
        }
        return order;
      })
    );
    showToast(
      `Order ${orderId} accepted & marked Out for Delivery!`,
      'success',
      `ಆರ್ಡರ್ ${orderId} ವಿತರಣೆಗೆ ರವಾನಿಸಲಾಗಿದೆ!`
    );
  };

  const declineSellerOrder = (orderId: string) => {
    playHaptic();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: 'cancelled' };
        }
        return order;
      })
    );
    showToast(`Order ${orderId} has been declined.`, 'warning', `ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ`);
  };

  const markOrderDelivered = (orderId: string) => {
    playHaptic();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedSteps = order.trackingSteps.map((step) => ({
            ...step,
            completed: true,
            current: false,
          }));
          return {
            ...order,
            status: 'delivered',
            trackingSteps: updatedSteps,
          };
        }
        return order;
      })
    );
    showToast(
      `Order ${orderId} marked as Delivered!`,
      'success',
      `ಆರ್ಡರ್ ತಲುಪಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ!`
    );
  };

  const addNewProduct = (productData: Partial<Product>) => {
    playHaptic();
    const newId = `p-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      name: productData.name || 'Local Farm Item',
      kannadaName: productData.kannadaName || 'ಸ್ಥಳೀಯ ತೋಟದ ಉತ್ಪನ್ನ',
      category: productData.category || 'fresh-produce',
      subCategory: productData.subCategory || 'Farm Produce',
      price: Number(productData.price) || 50,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
      unit: productData.unit || 'kg',
      image:
        productData.image ||
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewCount: 1,
      distanceKm: 1.2,
      vendorId: 'v2',
      vendorName: 'Lakshmi Stores & Mill',
      vendorLocation: 'Malleshwaram, Bengaluru',
      inStock: true,
      stockCount: Number(productData.stockCount) || 25,
      isOrganic: Boolean(productData.isOrganic),
      isLocallySourced: true,
      noChemicals: Boolean(productData.noChemicals),
      tags: ['Fresh Batch', 'Local Vendor'],
      description:
        productData.description || 'Authentic quality fresh produce sourced straight from local Karnataka growers.',
      harvestDate: 'Freshly packed today',
      nutritionalBenefits: ['100% Pure', 'Direct Farm Support'],
    };

    setProducts((prev) => [newProd, ...prev]);
    setSellerMetrics((prev) => ({
      ...prev,
      activeProducts: prev.activeProducts + 1,
    }));
    setSellerScreen('inventory');
    showToast(
      `"${newProd.name}" added to live marketplace!`,
      'success',
      `ಉತ್ಪನ್ನ ಮಾರುಕಟ್ಟೆಗೆ ಸೇರಿಸಲಾಗಿದೆ!`
    );
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStock = Math.max(0, newStock);
          return {
            ...p,
            stockCount: updatedStock,
            inStock: updatedStock > 0,
          };
        }
        return p;
      })
    );

    // Recompute low stock count
    setTimeout(() => {
      setSellerMetrics((prev) => {
        const low = products.filter((p) => p.stockCount < 10).length;
        return { ...prev, lowStockCount: low };
      });
    }, 100);

    showToast('Inventory updated', 'info');
  };

  const toggleShopOpen = () => {
    setIsShopOpen((prev) => !prev);
    showToast(
      !isShopOpen ? 'Store is now LIVE & accepting orders' : 'Store is paused temporarily',
      !isShopOpen ? 'success' : 'warning'
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        customerScreen,
        setCustomerScreen,
        sellerScreen,
        setSellerScreen,
        viewMode,
        setViewMode,
        language,
        setLanguage,
        selectedLocation,
        setSelectedLocation,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        categories,
        vendors,
        products,
        cart,
        orders,
        selectedProduct,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        sellerMetrics,
        weeklySales,
        topProducts,
        isShopOpen,
        toggleShopOpen,
        viewProductDetail,
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
        acceptSellerOrder,
        declineSellerOrder,
        markOrderDelivered,
        addNewProduct,
        updateProductStock,
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
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
