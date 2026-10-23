export type UserRole = 'customer' | 'seller' | 'admin' | 'rider';

export interface SavedAddress {
  id: string;
  userId: string;
  label: 'Home' | 'Work' | 'Other';
  recipientName: string;
  phone: string;
  addressLine: string;
  locality: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  deliveryAlerts: boolean;
  cancellationsAndRefunds: boolean;
  promotions: boolean;
  smsAlerts: boolean;
}

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
  savedAddresses?: SavedAddress[];
  notificationPreferences?: NotificationPreferences;
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
  // Phase 2 delivery configuration
  serviceablePincodes: string[];
  minOrderValue: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  estimatedPrepTimeMinutes: number;
  allowPickup: boolean;
  allowCod: boolean;
  deliveryPartnerType: 'self' | 'platform' | 'pickup_only';
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

export type FulfillmentType = 'delivery' | 'pickup';

export interface Order {
  id: string;
  parentOrderId?: string; // Links split sub-orders from multi-shop checkout
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
  fulfillmentType: FulfillmentType;
  pickupSlot?: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'ready_for_pickup'
    | 'shipped'
    | 'delivered'
    | 'picked_up'
    | 'cancelled';
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  deliveryAddress: string;
  deliveryLocality?: string;
  deliveryPincode?: string;
  deliverySlot: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentTransactionId: string;
  paymentGatewayOrderId?: string;
  paymentSignature?: string;
  refundStatus?: 'none' | 'pending' | 'processing' | 'successful' | 'failed';
  refundAmount?: number;
  refundTransactionId?: string;
  trackingReference?: string;
  estimatedDelivery: string;
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderCoordinates?: {
    latitude: number;
    longitude: number;
    addressLabel?: string;
    updatedAt: string;
  };
  deliveryOtp?: string;
  qrCodeToken?: string;
  cashCollected?: boolean;
  cashCollectedAt?: string;
  invoiceNumber?: string;
  fssaiNumber?: string;
  gstin?: string;
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
  status:
    | 'requested'
    | 'approved'
    | 'rejected'
    | 'pickup_pending'
    | 'returned'
    | 'refund_processing'
    | 'refunded';
  sellerNotes?: string;
  adminNotes?: string;
  refundAmount: number;
  refundTransactionId?: string;
  refundStatus?: 'pending' | 'processing' | 'successful' | 'failed';
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
  photos?: string[];
  verifiedPurchase: boolean;
  orderId?: string;
  status?: 'active' | 'reported' | 'hidden';
  reportReason?: string;
  reportedBy?: string;
  reportedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WebhookNotification {
  id: string;
  orderId: string;
  recipientPhone: string;
  recipientName: string;
  channel: 'whatsapp' | 'sms';
  templateName: string;
  message: string;
  trackingLink?: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  payload?: any;
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

export interface PaymentTransaction {
  id: string;
  orderId: string;
  parentOrderId?: string;
  gatewayOrderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded';
  errorMessage?: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundTransaction {
  id: string;
  orderId: string;
  returnId?: string;
  paymentTransactionId?: string;
  gatewayRefundId?: string;
  amount: number;
  status: 'pending' | 'processing' | 'successful' | 'failed';
  reason: string;
  deductionsNote?: string;
  initiatedBy: string;
  createdAt: string;
  processedAt?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'order' | 'refund' | 'review' | 'shop' | 'dispute' | 'policy';
  targetId: string;
  details: string;
  timestamp: string;
}
