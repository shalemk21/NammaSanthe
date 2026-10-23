import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { ReturnRequest } from '../types';

export const returnsRouter = Router();

// Submit a return & refund request
returnsRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, productId, reason, reasonDetails, imageEvidence } = req.body;

    if (!orderId || !productId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Product ID, and Return Reason are required',
      });
    }

    const order = dbStore.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customerId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.status !== 'delivered' && order.status !== 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested for orders that have been successfully delivered or picked up',
      });
    }

    const item = order.items.find((i) => i.productId === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found in this order' });
    }

    // Check return policy window
    const shop = dbStore.getShopById(order.vendorId);
    const returnWindowDays = shop?.returnPolicyWindowDays || 7;

    const deliveredDate = new Date(order.createdAt);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > returnWindowDays) {
      return res.status(400).json({
        success: false,
        message: `The return window for this item (${returnWindowDays} days) has expired. Order was placed ${diffDays} days ago.`,
      });
    }

    // Check if return request already exists for this order item
    const existing = dbStore
      .getReturns()
      .find((r) => r.orderId === orderId && r.productId === productId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A return request (${existing.id}) has already been submitted for this item`,
      });
    }

    const returnId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReturn: ReturnRequest = {
      id: returnId,
      orderId: order.id,
      customerId: req.user.id,
      customerName: req.user.name,
      vendorId: order.vendorId,
      vendorName: order.vendorName,
      productId: item.productId,
      productName: item.name,
      productImage: item.image,
      price: item.priceSnapshot,
      quantity: item.quantity,
      reason,
      reasonDetails: reasonDetails || 'Customer submitted return request',
      imageEvidence: imageEvidence || item.image,
      status: 'requested',
      refundAmount: item.priceSnapshot * item.quantity,
      refundStatus: 'pending',
      requestedAt: new Date().toISOString(),
      auditTrail: [
        {
          status: 'requested',
          note: `Customer requested return for ${reason}. Reason: ${reasonDetails || 'None'}`,
          timestamp: new Date().toISOString(),
          updatedBy: `${req.user.name} (Customer)`,
        },
      ],
    };

    dbStore.createReturn(newReturn);

    // Notify seller
    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      recipientRole: 'seller',
      recipientId: order.vendorId,
      title: `Return Requested: ${newReturn.id}`,
      kannadaTitle: `ರಿಟರ್ನ್ ವಿನಂತಿ ಬಂದಿದೆ`,
      message: `${req.user.name} requested a return for ${item.name} (Order #${order.id}). Reason: ${reason}.`,
      type: 'return',
      linkId: returnId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      returnRequest: newReturn,
      message: 'Return request submitted successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Error creating return' });
  }
});

// List return requests
returnsRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { status, vendorId } = req.query;
  let returns = dbStore.getReturns();

  if (req.user?.role === 'customer') {
    returns = returns.filter((r) => r.customerId === req.user?.id);
  } else if (req.user?.role === 'seller') {
    const sId = vendorId && typeof vendorId === 'string' ? vendorId : req.user.shopId;
    returns = returns.filter((r) => r.vendorId === sId);
  }
  // Admin sees all

  if (status && typeof status === 'string' && status !== 'all') {
    returns = returns.filter((r) => r.status === status);
  }

  return res.json({ success: true, count: returns.length, returns });
});

// Get return details
returnsRouter.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const ret = dbStore.getReturnById(req.params.id);
  if (!ret) return res.status(404).json({ success: false, message: 'Return request not found' });

  if (req.user?.role === 'customer' && ret.customerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  if (req.user?.role === 'seller' && ret.vendorId !== req.user.shopId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  return res.json({ success: true, returnRequest: ret });
});

// Seller or Admin Decision (Approve / Reject)
returnsRouter.put('/:id/decision', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const ret = dbStore.getReturnById(req.params.id);
  if (!ret) return res.status(404).json({ success: false, message: 'Return request not found' });

  if (req.user?.role !== 'admin' && req.user?.shopId !== ret.vendorId) {
    return res.status(403).json({ success: false, message: 'Unauthorized to decide on this return' });
  }

  const { decision, notes } = req.body; // 'approved' | 'rejected'
  if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
    return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
  }

  // Mandatory rejection reason requirement from Phase 2 Prompt
  if (decision === 'rejected' && (!notes || notes.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'A detailed rejection reason is strictly required when rejecting a return request.',
    });
  }

  const newStatus = decision === 'approved' ? 'approved' : 'rejected';
  const roleName = req.user?.role === 'admin' ? 'Marketplace Administrator' : 'Local Store Seller';

  ret.status = newStatus;
  ret.refundStatus = decision === 'approved' ? 'processing' : 'failed';
  if (req.user?.role === 'admin') {
    ret.adminNotes = notes || `Decided by Admin: ${decision}`;
  } else {
    ret.sellerNotes = notes || `Decided by Seller: ${decision}`;
  }

  ret.auditTrail.push({
    status: newStatus,
    note: notes || `Return was ${newStatus} by ${roleName}.`,
    timestamp: new Date().toISOString(),
    updatedBy: `${req.user?.name} (${roleName})`,
  });

  const updated = dbStore.updateReturn(ret.id, {
    status: newStatus,
    refundStatus: ret.refundStatus,
    sellerNotes: ret.sellerNotes,
    adminNotes: ret.adminNotes,
    auditTrail: ret.auditTrail,
  });

  // Notify customer
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'customer',
    recipientId: ret.customerId,
    title: `Return ${newStatus.toUpperCase()}: ${ret.id}`,
    kannadaTitle: `ರಿಟರ್ನ್ ${newStatus === 'approved' ? 'ಅನುಮೋದಿಸಲಾಗಿದೆ' : 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ'}`,
    message: `Your return request for "${ret.productName}" was ${newStatus}. Note: ${notes || 'Status updated'}`,
    type: 'return',
    linkId: ret.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  dbStore.createAuditLog({
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: req.user!.role,
    action: `RETURN_${newStatus.toUpperCase()}`,
    targetType: 'refund',
    targetId: ret.id,
    details: `Return #${ret.id} ${newStatus}. Note: ${notes || 'None'}`,
  });

  return res.json({ success: true, returnRequest: updated });
});

// Progress Return Status (pickup_pending -> returned -> refund_processing -> refunded)
returnsRouter.put('/:id/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const ret = dbStore.getReturnById(req.params.id);
  if (!ret) return res.status(404).json({ success: false, message: 'Return not found' });

  if (req.user?.role !== 'admin' && req.user?.shopId !== ret.vendorId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { status, note } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  ret.status = status;

  // If item arrived at store ('returned'), restore inventory!
  if (status === 'returned') {
    dbStore.restoreStock(ret.productId, ret.quantity);
  }

  // If refunded, generate refund transaction ID and record transaction
  if (status === 'refunded') {
    ret.refundTransactionId = `REFUND-RET-${Date.now().toString().slice(-6)}`;
    ret.refundStatus = 'successful';
    ret.resolvedAt = new Date().toISOString();

    dbStore.createRefundTransaction({
      id: `ref-tx-${Date.now()}`,
      orderId: ret.orderId,
      returnId: ret.id,
      amount: ret.refundAmount,
      status: 'successful',
      gatewayRefundId: ret.refundTransactionId,
      reason: `Return #${ret.id} verified and refunded: ${ret.reason}`,
      initiatedBy: `${req.user!.name} (${req.user!.role})`,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });
  }

  ret.auditTrail.push({
    status,
    note: note || `Return status progressed to ${status}`,
    timestamp: new Date().toISOString(),
    updatedBy: `${req.user?.name} (${req.user?.role})`,
  });

  const updated = dbStore.updateReturn(ret.id, {
    status,
    refundStatus: ret.refundStatus,
    refundTransactionId: ret.refundTransactionId,
    resolvedAt: ret.resolvedAt,
    auditTrail: ret.auditTrail,
  });

  // Notify customer
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'customer',
    recipientId: ret.customerId,
    title: `Return Status: ${status.replace('_', ' ').toUpperCase()}`,
    kannadaTitle: `ರಿಟರ್ನ್ ಸ್ಥಿತಿ ನವೀಕರಣ`,
    message: note || `Return #${ret.id} is now ${status}. ${status === 'refunded' ? `Refund of ₹${ret.refundAmount} issued via payment gateway.` : ''}`,
    type: 'return',
    linkId: ret.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, returnRequest: updated });
});
