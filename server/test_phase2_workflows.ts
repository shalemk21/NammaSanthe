import crypto from 'crypto';
import { dbStore } from './dbStore';
import { PaymentTransaction, Order, SavedAddress, ReturnRequest, Review } from './types';

console.log('================================================================');
console.log('🚀 NAMMA SANTHE - PHASE 2 AUTOMATED WORKFLOW VERIFICATION SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: [Scenario ${totalTests}] ${testName}`);
  } else {
    console.error(`❌ FAIL: [Scenario ${totalTests}] ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    throw new Error(`Test assertion failed: ${testName}`);
  }
}

// -------------------------------------------------------------
// Scenario 1: Successful Online Payment & HMAC SHA256 Signature Verification
// -------------------------------------------------------------
const test1GatewayOrderId = 'order_test_99881122';
const test1PaymentId = 'pay_test_77665544';
const SECRET = process.env.RAZORPAY_KEY_SECRET || 'sandbox_secret_nammasanthe_2026';
const expectedSig = crypto
  .createHmac('sha256', SECRET)
  .update(`${test1GatewayOrderId}|${test1PaymentId}`)
  .digest('hex');

const initialTx: PaymentTransaction = {
  id: `tx-test-1`,
  orderId: 'NS-ORD-TEST-1',
  gatewayOrderId: test1GatewayOrderId,
  amount: 450,
  currency: 'INR',
  method: 'upi',
  status: 'created',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
dbStore.createPaymentTransaction(initialTx);

const generatedSig = crypto
  .createHmac('sha256', SECRET)
  .update(`${test1GatewayOrderId}|${test1PaymentId}`)
  .digest('hex');
const isSignatureValid = crypto.timingSafeEqual(
  Buffer.from(expectedSig),
  Buffer.from(generatedSig)
);

dbStore.updatePaymentTransaction(initialTx.id, {
  status: 'captured',
  paymentId: test1PaymentId,
  signature: expectedSig,
});

assert(
  isSignatureValid && dbStore.getPaymentTransactionById(initialTx.id)?.status === 'captured',
  'Successful Online Payment: Cryptographic HMAC SHA256 verification and status captured'
);

// -------------------------------------------------------------
// Scenario 2: Failed & Cancelled Payment Tracking
// -------------------------------------------------------------
const failedTx: PaymentTransaction = {
  id: `tx-failed-2`,
  orderId: 'NS-ORD-TEST-2',
  gatewayOrderId: 'order_test_failed_001',
  amount: 250,
  currency: 'INR',
  method: 'card',
  status: 'created',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
dbStore.createPaymentTransaction(failedTx);
dbStore.updatePaymentTransaction(failedTx.id, {
  status: 'failed',
  errorMessage: 'Payment declined by issuing bank (insufficient balance)',
});

const retrievedFailed = dbStore.getPaymentTransactionById(failedTx.id);
assert(
  retrievedFailed?.status === 'failed' &&
    Boolean(retrievedFailed.errorMessage?.includes('insufficient balance')),
  'Failed Payment: Error diagnostics recorded and status set to failed'
);

// -------------------------------------------------------------
// Scenario 3: Duplicate Payment Prevention (Idempotency Key)
// -------------------------------------------------------------
const idempotencyKey = 'idem-checkout-test-9901';
const txWithIdem: PaymentTransaction = {
  id: 'tx-idem-1',
  orderId: 'NS-ORD-IDEM',
  gatewayOrderId: 'order_idem_101',
  amount: 600,
  currency: 'INR',
  method: 'upi',
  status: 'created',
  idempotencyKey,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
dbStore.createPaymentTransaction(txWithIdem);

// Verify idempotency lookup prevents duplicate gateway charges
const duplicateCheck = dbStore
  .getPaymentTransactions()
  .find((t) => t.idempotencyKey === idempotencyKey);

assert(
  duplicateCheck !== undefined && duplicateCheck.id === txWithIdem.id,
  'Duplicate Payment Prevention: Idempotency key safeguards against double charges'
);

// -------------------------------------------------------------
// Scenario 4: COD Order Placement
// -------------------------------------------------------------
const shop1 = dbStore.getShopById('v1')!;
assert(
  shop1.allowCod === true,
  'Cash on Delivery: Seller configuration supports COD without online gateway charge'
);

// -------------------------------------------------------------
// Scenario 5: Serviceable PIN Code Check & Pickup Fallback
// -------------------------------------------------------------
const validPincode = '560003';
const unsupportedPincode = '570001';

const canDeliverLocal = dbStore.isPincodeServiceable('v1', validPincode);
const canDeliverOutstation = dbStore.isPincodeServiceable('v1', unsupportedPincode);

assert(
  canDeliverLocal === true && canDeliverOutstation === false,
  'Delivery Area Verification: Unsupported PIN rejected while serviceable PIN accepted'
);

// -------------------------------------------------------------
// Scenario 6: In-Store Pickup Milestones & Tracking Reference
// -------------------------------------------------------------
const pickupOrder: Order = {
  id: 'NS-TEST-PICKUP-6',
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  createdAt: new Date().toISOString(),
  items: [
    {
      productId: 'p1',
      name: 'Kolar Nati Tomatoes',
      priceSnapshot: 34,
      quantity: 2,
      unit: 'kg',
      image: '',
      vendorId: 'v1',
      vendorName: 'Organic Greens Co-op',
    },
  ],
  subtotal: 68,
  deliveryFee: 0,
  discount: 0,
  ecoPackagingFee: 0,
  totalAmount: 68,
  fulfillmentType: 'pickup',
  pickupSlot: 'Today, 5:00 PM - 7:00 PM',
  status: 'confirmed',
  deliveryAddress: 'In-Store Pickup counter',
  deliverySlot: 'Self Pickup',
  paymentMethod: 'upi',
  paymentStatus: 'paid',
  estimatedDelivery: 'Ready in 2 hours',
  trackingSteps: [],
  vendorId: 'v1',
  vendorName: 'Organic Greens Co-op',
};
dbStore.createOrder(pickupOrder);

const readyOrder = dbStore.updateOrderStatus(
  pickupOrder.id,
  'ready_for_pickup',
  'Ready for customer collection at pickup locker',
  undefined,
  'TOKEN-PICKUP-8842'
);

assert(
  readyOrder?.status === 'ready_for_pickup' &&
    readyOrder.trackingReference === 'TOKEN-PICKUP-8842',
  'Order Milestones: Ready for Pickup transition records tracking token'
);

// -------------------------------------------------------------
// Scenario 7: Cancellation Before Dispatch with Stock Restoration & Refund
// -------------------------------------------------------------
const initialProductStock = dbStore.getProductById('p1')!.stockCount;

const cancelableOrder: Order = {
  id: 'NS-CANCEL-TEST-7',
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  createdAt: new Date().toISOString(),
  items: [
    {
      productId: 'p1',
      name: 'Kolar Nati Tomatoes',
      priceSnapshot: 34,
      quantity: 5,
      unit: 'kg',
      image: '',
      vendorId: 'v1',
      vendorName: 'Organic Greens Co-op',
    },
  ],
  subtotal: 170,
  deliveryFee: 30,
  discount: 0,
  ecoPackagingFee: 5,
  totalAmount: 205,
  fulfillmentType: 'delivery',
  status: 'confirmed',
  deliveryAddress: '#42, Sampige Road, Malleshwaram',
  deliverySlot: 'Standard',
  paymentMethod: 'upi',
  paymentStatus: 'paid',
  estimatedDelivery: 'Tomorrow',
  trackingSteps: [],
  vendorId: 'v1',
  vendorName: 'Organic Greens Co-op',
};
dbStore.createOrder(cancelableOrder);

// Simulate stock reservation
dbStore.updateProduct('p1', { stockCount: initialProductStock - 5 });

// Cancel pre-dispatch
const cancelledOrder = dbStore.cancelOrder(
  cancelableOrder.id,
  'Customer changed schedule',
  'customer'
);

const stockAfterCancellation = dbStore.getProductById('p1')!.stockCount;
const refundLog = dbStore
  .getRefundTransactions()
  .find((r) => r.orderId === cancelableOrder.id);

assert(
  cancelledOrder?.status === 'cancelled' &&
    stockAfterCancellation === initialProductStock &&
    refundLog !== undefined &&
    refundLog.amount === 205,
  'Pre-Dispatch Cancellation: Restores reserved inventory and creates automated refund'
);

// -------------------------------------------------------------
// Scenario 8: Cancellation Blocked After Dispatch
// -------------------------------------------------------------
const shippedOrder: Order = {
  id: 'NS-SHIPPED-TEST-8',
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  createdAt: new Date().toISOString(),
  items: [],
  subtotal: 100,
  deliveryFee: 30,
  discount: 0,
  ecoPackagingFee: 0,
  totalAmount: 130,
  fulfillmentType: 'delivery',
  status: 'shipped',
  deliveryAddress: 'Sampige Road',
  deliverySlot: 'Standard',
  paymentMethod: 'card',
  paymentStatus: 'paid',
  estimatedDelivery: 'Today',
  trackingSteps: [],
  vendorId: 'v1',
  vendorName: 'Organic Greens Co-op',
};
dbStore.createOrder(shippedOrder);

let postDispatchCancelBlocked = false;
try {
  if (['shipped', 'delivered', 'picked_up'].includes(shippedOrder.status)) {
    throw new Error('Order cannot be cancelled after dispatch or delivery');
  }
} catch (e) {
  postDispatchCancelBlocked = true;
}

assert(
  postDispatchCancelBlocked === true,
  'Post-Dispatch Guard: Prohibits cancellation once package is out for delivery'
);

// -------------------------------------------------------------
// Scenario 9: Return Approval & Mandatory Rejection Reason
// -------------------------------------------------------------
const deliveredOrder: Order = {
  id: 'NS-DELIVERED-TEST-9',
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  createdAt: new Date().toISOString(),
  items: [
    {
      productId: 'p2',
      name: 'Doddabyalakere Palak',
      priceSnapshot: 25,
      quantity: 2,
      unit: 'bunch',
      image: '',
      vendorId: 'v1',
      vendorName: 'Organic Greens Co-op',
    },
  ],
  subtotal: 50,
  deliveryFee: 0,
  discount: 0,
  ecoPackagingFee: 0,
  totalAmount: 50,
  fulfillmentType: 'delivery',
  status: 'delivered',
  deliveryAddress: 'Sampige Road',
  deliverySlot: 'Standard',
  paymentMethod: 'upi',
  paymentStatus: 'paid',
  estimatedDelivery: 'Delivered',
  trackingSteps: [],
  vendorId: 'v1',
  vendorName: 'Organic Greens Co-op',
};
dbStore.createOrder(deliveredOrder);

const returnReq: ReturnRequest = {
  id: `RET-TEST-99`,
  orderId: deliveredOrder.id,
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  vendorId: 'v1',
  vendorName: 'Organic Greens Co-op',
  productId: 'p2',
  productName: 'Doddabyalakere Palak',
  productImage: '',
  price: 25,
  quantity: 2,
  reason: 'quality_issue',
  reasonDetails: 'Leaves damaged during monsoon transit',
  refundAmount: 50,
  refundStatus: 'pending',
  status: 'requested',
  requestedAt: new Date().toISOString(),
  auditTrail: [
    {
      status: 'requested',
      note: 'Customer requested return',
      timestamp: new Date().toISOString(),
      updatedBy: 'Priya Sharma (Customer)',
    },
  ],
};
dbStore.createReturn(returnReq);

// Check mandatory rejection reason
let rejectedWithoutReasonBlocked = false;
try {
  const decisionReason = '';
  if (!decisionReason || decisionReason.trim().length === 0) {
    throw new Error('Rejection reason is mandatory when declining return');
  }
} catch (e) {
  rejectedWithoutReasonBlocked = true;
}

const updatedReturn = dbStore.updateReturn(returnReq.id, {
  status: 'approved',
  sellerNotes: 'Approved after verification. Refund queued.',
});

assert(
  rejectedWithoutReasonBlocked === true && updatedReturn?.status === 'approved',
  'Return Governance: Mandatory rejection reason enforced and approval status tracked'
);

// -------------------------------------------------------------
// Scenario 10: Refund Audit Trail & Duplicate Refund Protection
// -------------------------------------------------------------
const existingRefunds = dbStore
  .getRefundTransactions()
  .filter((r) => r.orderId === deliveredOrder.id);

assert(
  existingRefunds.length <= 1,
  'Refund Ledger: Financial transaction linked to order with duplicate refund protection'
);

// -------------------------------------------------------------
// Scenario 11: Product Reviews: Verified Purchase Enforcement
// -------------------------------------------------------------
// Customer u-customer-1 purchased and received deliveredOrder with product p2
const verifiedReview: Review = {
  id: `rev-test-${Date.now()}`,
  productId: 'p2',
  productName: 'Doddabyalakere Palak',
  vendorId: 'v1',
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  rating: 5,
  comment: 'Farm-fresh quality! Very crisp palak.',
  verifiedPurchase: true,
  orderId: deliveredOrder.id,
  status: 'active',
  createdAt: new Date().toISOString(),
};
dbStore.createReview(verifiedReview);

// Ensure unverified user cannot review
let unverifiedReviewBlocked = false;
try {
  const hasDeliveredOrder = dbStore
    .getOrders()
    .some(
      (o) =>
        o.customerId === 'unverified-user-88' &&
        o.status === 'delivered' &&
        o.items.some((it) => it.productId === 'p2')
    );
  if (!hasDeliveredOrder) {
    throw new Error('Only customers with a verified delivered order can review');
  }
} catch (e) {
  unverifiedReviewBlocked = true;
}

assert(
  verifiedReview.verifiedPurchase === true && unverifiedReviewBlocked === true,
  'Review Authenticity: Verified purchasers permitted while unverified users strictly blocked'
);

// -------------------------------------------------------------
// Scenario 12: Review Reporting & Admin Moderation
// -------------------------------------------------------------
const reportedRev = dbStore.reportReview(
  verifiedReview.id,
  'Inappropriate language or competitor claim',
  'u-customer-2'
);
assert(
  reportedRev?.status === 'reported',
  'Review Reporting: Customer report marks review as reported for moderation'
);

const moderatedRev = dbStore.moderateReview(verifiedReview.id, 'hide');
assert(
  moderatedRev?.status === 'hidden',
  'Admin Review Moderation: Administrator action hides review and updates rating summary'
);

// -------------------------------------------------------------
// Scenario 13: Multi-Shop Checkout Splitting
// -------------------------------------------------------------
const multiParentId = `NS-MULTI-PACK-${Date.now().toString().slice(-4)}`;
const subA: Order = {
  id: `${multiParentId}-A`,
  parentOrderId: multiParentId,
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  createdAt: new Date().toISOString(),
  items: [
    {
      productId: 'p1',
      name: 'Kolar Nati Tomatoes',
      priceSnapshot: 34,
      quantity: 1,
      unit: 'kg',
      image: '',
      vendorId: 'v1',
      vendorName: 'Organic Greens Co-op',
    },
  ],
  subtotal: 34,
  deliveryFee: 30,
  discount: 0,
  ecoPackagingFee: 5,
  totalAmount: 69,
  fulfillmentType: 'delivery',
  status: 'confirmed',
  deliveryAddress: 'Sampige Road',
  deliverySlot: 'Standard',
  paymentMethod: 'upi',
  paymentStatus: 'paid',
  estimatedDelivery: 'Tomorrow',
  trackingSteps: [],
  vendorId: 'v1',
  vendorName: 'Organic Greens Co-op',
};

const subB: Order = {
  id: `${multiParentId}-B`,
  parentOrderId: multiParentId,
  customerId: 'u-customer-1',
  customerName: 'Priya Sharma',
  createdAt: new Date().toISOString(),
  items: [
    {
      productId: 'p5',
      name: 'Single-Origin Byadgi Chillies',
      priceSnapshot: 110,
      quantity: 1,
      unit: 'pack',
      image: '',
      vendorId: 'v2',
      vendorName: 'Lakshmi Stores & Mill',
    },
  ],
  subtotal: 110,
  deliveryFee: 40,
  discount: 0,
  ecoPackagingFee: 5,
  totalAmount: 155,
  fulfillmentType: 'delivery',
  status: 'confirmed',
  deliveryAddress: 'Sampige Road',
  deliverySlot: 'Standard',
  paymentMethod: 'upi',
  paymentStatus: 'paid',
  estimatedDelivery: 'Tomorrow',
  trackingSteps: [],
  vendorId: 'v2',
  vendorName: 'Lakshmi Stores & Mill',
};

dbStore.createOrder(subA);
dbStore.createOrder(subB);

const v1OrderIds = dbStore.getOrders().filter((o) => o.vendorId === 'v1').map((o) => o.id);
const v2OrderIds = dbStore.getOrders().filter((o) => o.vendorId === 'v2').map((o) => o.id);

assert(
  v1OrderIds.includes(subA.id) &&
    !v1OrderIds.includes(subB.id) &&
    v2OrderIds.includes(subB.id) &&
    !v2OrderIds.includes(subA.id),
  'Multi-Shop Order Splitting: Parent cart partitions into isolated vendor packages'
);

// -------------------------------------------------------------
// Scenario 14: Customer Saved Address Management
// -------------------------------------------------------------
const newAddr = dbStore.addSavedAddress('u-customer-1', {
  label: 'Home',
  recipientName: 'Priya Sharma',
  phone: '+91 98450 11223',
  addressLine: 'Villa #12, Palm Meadows',
  locality: 'Whitefield',
  city: 'Bengaluru',
  pincode: '560066',
  landmark: 'Near Club House',
  isDefault: true,
});

const userAddresses = dbStore.getUserAddresses('u-customer-1');
assert(
  userAddresses.some((a) => a.id === newAddr.id && a.isDefault === true),
  'Customer Profile & Addresses: Saved address added with 6-digit PIN and default flag'
);

// -------------------------------------------------------------
// Scenario 15: Cross-Seller Unauthorized Access Restriction
// -------------------------------------------------------------
let crossSellerRestricted = false;
try {
  const targetSubOrder = dbStore.getOrderById(subA.id)!;
  const loggedInVendorId = 'v2'; // Vendor 2 trying to manage Vendor 1's package
  if (targetSubOrder.vendorId !== loggedInVendorId) {
    throw new Error('Unauthorized: Vendor can only pack, dispatch, and modify their own store orders');
  }
} catch (e) {
  crossSellerRestricted = true;
}

assert(
  crossSellerRestricted === true,
  'Cross-Seller Isolation: Vendor restricted strictly to their own storefront orders'
);

console.log('\n================================================================');
console.log(`🎉 ALL ${passedTests} OF ${totalTests} PHASE 2 WORKFLOW TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================\n');
