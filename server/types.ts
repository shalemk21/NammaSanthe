export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  address?: string;
  locality?: string;
  city?: string;
  pincode?: string;
  shopId?: string; // If role is seller
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  kannadaName: string;
  ownerId: string;
  type: string;
  location: string;
  city: string;
  locality: string;
  pincode: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  verificationNotes?: string;
  avatar: string;
  coverImage: string;
  speciality: string;
  openStatus: boolean;
  phone: string;
  operatingHours: string;
  serviceableLocalities: string[];
  serviceableRadiusKm: number;
  returnPolicyWindowDays: number;
  returnPolicyDetails: string;
  createdAt: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorLocation: string;
  name: string;
  kannadaName: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  reservedCount: number;
  isOrganic: boolean;
  isLocallySourced: boolean;
  noChemicals: boolean;
  tags: string[];
  description: string;
  harvestDate?: string;
  nutritionalBenefits?: string[];
  specifications?: ProductSpecification[];
  isDealOfTheDay?: boolean;
  dealDiscount?: number;
  returnWindowDays: number;
  isSuspicious?: boolean;
  createdAt: string;
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

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  kannadaName?: string;
  image: string;
  unit: string;
  priceSnapshot: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
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
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  ecoPackagingFee: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  cancellationReason?: string;
  deliveryAddress: string;
  deliveryLocality?: string;
  deliveryPincode?: string;
  deliverySlot: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentTransactionId: string;
  estimatedDelivery: string;
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  trackingSteps: TrackingStep[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  reason: 'damaged' | 'expired' | 'wrong_item' | 'quality_issue' | 'changed_mind' | 'other';
  reasonDetails: string;
  imageEvidence?: string;
  status: 'requested' | 'approved' | 'rejected' | 'pickup_pending' | 'returned' | 'refund_processing' | 'refunded';
  sellerNotes?: string;
  adminNotes?: string;
  refundAmount: number;
  refundTransactionId?: string;
  requestedAt: string;
  resolvedAt?: string;
  auditTrail: {
    status: string;
    note: string;
    timestamp: string;
    updatedBy: string;
  }[];
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Dispute {
  id: string;
  returnId?: string;
  orderId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  subject: string;
  customerStatement: string;
  sellerStatement?: string;
  adminDecision?: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole;
  recipientId: string;
  title: string;
  kannadaTitle?: string;
  message: string;
  type: 'order' | 'delivery' | 'return' | 'dispute' | 'stock' | 'system';
  linkId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  kannadaTitle: string;
  subtitle: string;
  badge: string;
  image: string;
  linkCategory?: string;
  active: boolean;
}
