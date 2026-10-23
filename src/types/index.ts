export type UserRole = 'customer' | 'seller';

export type CustomerScreen =
  | 'splash'
  | 'home'
  | 'categories'
  | 'listing'
  | 'detail'
  | 'cart'
  | 'orders'
  | 'profile';

export type SellerScreen =
  | 'dashboard'
  | 'inventory'
  | 'add_product'
  | 'orders'
  | 'analytics';

export interface Product {
  id: string;
  name: string;
  kannadaName: string;
  category: string; // 'fresh-produce' | 'groceries' | 'home-kitchen' | 'handicrafts' | 'fashion' | 'personal-care'
  subCategory?: string; // 'Vegetables' | 'Fruits' | 'Greens' | 'Traditional Snacks' etc.
  price: number;
  originalPrice?: number;
  unit: string; // 'kg' | 'bunch' | 'pack' | 'jar' | 'piece'
  image: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  inStock: boolean;
  stockCount: number;
  isOrganic: boolean;
  isLocallySourced: boolean;
  noChemicals: boolean;
  tags: string[];
  description: string;
  harvestDate?: string;
  nutritionalBenefits?: string[];
  isDealOfTheDay?: boolean;
  dealDiscount?: number;
}

export interface Vendor {
  id: string;
  name: string;
  kannadaName: string;
  type: string;
  location: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  avatar: string;
  coverImage: string;
  speciality: string;
  openStatus: boolean;
  phone: string;
}

export interface Category {
  id: string;
  name: string;
  kannadaName: string;
  iconName: string;
  itemCount: number;
  badge?: string;
  color: string;
  gradient: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TrackingStep {
  step: string;
  kannadaStep: string;
  time: string;
  completed: boolean;
  current: boolean;
  description: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  ecoPackagingFee: number;
  totalAmount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  deliverySlot: string;
  paymentMethod: string;
  estimatedDelivery: string;
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  trackingSteps: TrackingStep[];
  vendorId: string;
  vendorName: string;
}

export interface SellerMetric {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: string;
}

export interface DailySalesData {
  day: string;
  date: string;
  amount: number;
  orders: number;
}

export interface TopProductPerformance {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
  growth: number;
  image: string;
}
