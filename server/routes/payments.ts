import { Router, Response } from 'express';
import crypto from 'crypto';
import { dbStore } from '../dbStore';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { PaymentTransaction } from '../types';

export const paymentsRouter = Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_NammaSantheDevKey2026';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'sandbox_secret_nammasanthe_2026';

// 1. Get Payment Configuration for Frontend
paymentsRouter.get('/config', (_req, res: Response) => {
  res.json({
    success: true,
    keyId: RAZORPAY_KEY_ID,
    currency: 'INR',
    isSandbox: !process.env.RAZORPAY_KEY_ID,
    supportedMethods: ['upi', 'card', 'netbanking', 'wallet', 'cod'],
    gatewayName: 'Razorpay Sandbox (Namma Santhe Secure)',
  });
});

// 1.1 Verify Pincode Serviceability
paymentsRouter.get('/verify-pincode/:pincode', (req, res: Response) => {
  try {
    const { pincode } = req.params;
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: 'Invalid 6-digit PIN code format',
      });
    }

    const cleanPin = pincode.trim();
    const shops = dbStore.getShops();
    const servicingShops = shops.filter((s) => dbStore.isPincodeServiceable(s.id, cleanPin));
    const isServiceable = servicingShops.length > 0;

    return res.json({
      success: true,
      pincode: cleanPin,
      serviceable: isServiceable,
      servicingShopsCount: servicingShops.length,
      message: isServiceable
        ? `PIN code ${cleanPin} is serviceable for delivery (${servicingShops.length} local shop${servicingShops.length > 1 ? 's' : ''}).`
        : `PIN code ${cleanPin} is outside our current hyperlocal delivery network.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Create Payment Gateway Order (Backend Secure Creation)
paymentsRouter.post('/create-order', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, notes, idempotencyKey } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    // Idempotency check: if an order with this idempotency key already exists, return existing order
    if (idempotencyKey) {
      const existing = dbStore
        .getPaymentTransactions()
        .find((tx) => tx.idempotencyKey === idempotencyKey);
      if (existing) {
        return res.json({
          success: true,
          gatewayOrderId: existing.gatewayOrderId,
          amount: existing.amount,
          currency: existing.currency,
          keyId: RAZORPAY_KEY_ID,
          isDuplicate: true,
          transaction: existing,
        });
      }
    }

    // In sandbox mode or live Razorpay, generate standard order ID
    const gatewayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const amountInPaise = Math.round(amount * 100);

    const transaction: PaymentTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: receipt || `NS-PENDING-${Date.now().toString().slice(-4)}`,
      gatewayOrderId,
      amount: Number(amount),
      currency: currency || 'INR',
      method: (notes?.paymentMethod as any) || 'upi',
      status: 'created',
      idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createPaymentTransaction(transaction);

    return res.status(201).json({
      success: true,
      gatewayOrderId,
      amount: amountInPaise,
      amountRupees: amount,
      currency,
      keyId: RAZORPAY_KEY_ID,
      receipt: transaction.orderId,
      transactionId: transaction.id,
      notes: notes || {},
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error creating payment gateway order',
    });
  }
});

// 3. Verify Payment Signature & Confirm Payment
paymentsRouter.post('/verify', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod = 'upi',
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay signature verification parameters',
      });
    }

    // Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Record failed transaction attempt
      const tx = dbStore.getPaymentTransactionByGatewayOrderId(razorpay_order_id);
      if (tx) {
        dbStore.updatePaymentTransaction(tx.id, {
          status: 'failed',
          errorMessage: 'Signature verification mismatch',
          updatedAt: new Date().toISOString(),
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature',
      });
    }

    // Update Transaction
    const existingTx = dbStore.getPaymentTransactionByGatewayOrderId(razorpay_order_id);
    let updatedTx: PaymentTransaction | undefined = undefined;
    if (existingTx) {
      updatedTx = dbStore.updatePaymentTransaction(existingTx.id, {
        status: 'captured',
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        method: paymentMethod as any,
        orderId: orderId || existingTx.orderId,
        updatedAt: new Date().toISOString(),
      });
    }

    // If orderId was provided, update order payment status
    if (orderId) {
      const order = dbStore.getOrderById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.paymentTransactionId = razorpay_payment_id;
        order.paymentGatewayOrderId = razorpay_order_id;
        order.paymentSignature = razorpay_signature;
        order.paymentMethod = paymentMethod.toUpperCase();
        dbStore.updateOrderStatus(order.id, 'confirmed', 'Payment verified and authorized via Razorpay.');
      }
    }

    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      status: 'captured',
      message: 'Payment verified and captured successfully.',
      transaction: updatedTx,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error verifying payment signature',
    });
  }
});

// 4. Record Payment Failure or Cancellation
paymentsRouter.post('/record-failure', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { razorpay_order_id, reason, code, orderId } = req.body;

    if (razorpay_order_id) {
      const tx = dbStore.getPaymentTransactionByGatewayOrderId(razorpay_order_id);
      if (tx) {
        dbStore.updatePaymentTransaction(tx.id, {
          status: code === 'PAYMENT_CANCELLED' ? 'cancelled' : 'failed',
          errorMessage: reason || 'User cancelled or gateway rejected payment',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (orderId) {
      const order = dbStore.getOrderById(orderId);
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        dbStore.createNotification({
          id: `notif-${Date.now()}`,
          recipientRole: 'customer',
          recipientId: req.user!.id,
          title: 'Payment Failed or Cancelled',
          kannadaTitle: 'ಪಾವತಿ ವಿಫಲವಾಗಿದೆ',
          message: `Your payment for order #${orderId} was not completed: ${reason || 'Transaction cancelled'}. You can retry anytime.`,
          type: 'order',
          linkId: orderId,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return res.json({
      success: true,
      status: 'failed',
      message: 'Payment failure recorded successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Trigger Sandbox / Gateway Refund
paymentsRouter.post('/refund', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ success: false, message: 'Order ID and refund amount are required' });
    }

    const order = dbStore.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role check: Admin or Seller of this order
    if (req.user?.role !== 'admin' && req.user?.shopId !== order.vendorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to initiate refunds' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund an order that was not paid online (e.g. COD or pending)',
      });
    }

    // Prevent duplicate refunds exceeding total order amount
    const existingRefunds = dbStore
      .getRefundTransactions()
      .filter((r) => r.orderId === orderId && r.status === 'successful');
    const refundedSoFar = existingRefunds.reduce((acc, curr) => acc + curr.amount, 0);

    if (refundedSoFar + amount > order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Requested refund of ₹${amount} exceeds remaining refundable balance (₹${order.totalAmount - refundedSoFar})`,
      });
    }

    const refundTxId = `rfnd_${crypto.randomBytes(8).toString('hex')}`;
    const refundRecord = dbStore.createRefundTransaction({
      id: `ref-${Date.now()}`,
      orderId: order.id,
      amount: Number(amount),
      status: 'successful',
      gatewayRefundId: refundTxId,
      reason: reason || 'Merchant or Admin approved refund',
      initiatedBy: `${req.user.name} (${req.user.role})`,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    order.refundStatus = 'successful';
    order.refundAmount = (order.refundAmount || 0) + Number(amount);
    order.refundTransactionId = refundTxId;
    if (order.refundAmount >= order.totalAmount) {
      order.paymentStatus = 'refunded';
    }

    // Notify customer
    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      recipientRole: 'customer',
      recipientId: order.customerId,
      title: `Refund Processed: ₹${amount}`,
      kannadaTitle: `ಮರುಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ`,
      message: `A refund of ₹${amount} for order #${order.id} has been credited to your source payment method. Ref ID: ${refundTxId}.`,
      type: 'order',
      linkId: order.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Create Audit Log
    dbStore.createAuditLog({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PROCESS_REFUND',
      targetType: 'refund',
      targetId: refundRecord.id,
      details: `Refunded ₹${amount} for order #${order.id}. Reason: ${reason || 'N/A'}. Gateway Ref: ${refundTxId}`,
    });

    return res.json({
      success: true,
      refund: refundRecord,
      message: `Refund of ₹${amount} processed successfully via Razorpay Gateway`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Helper for generating signature in sandbox simulator
paymentsRouter.post('/generate-sandbox-signature', (req, res: Response) => {
  const { orderId, paymentId } = req.body;
  const pId = paymentId || `pay_${crypto.randomBytes(8).toString('hex')}`;
  const signature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${pId}`)
    .digest('hex');

  res.json({
    success: true,
    paymentId: pId,
    orderId,
    signature,
  });
});
