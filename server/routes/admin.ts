import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { PromotionalBanner } from '../types';

export const adminRouter = Router();

// Protect all admin endpoints
adminRouter.use(authenticate, requireRole('admin'));

// Platform-wide overview statistics
adminRouter.get('/stats', (_req, res: Response) => {
  const stats = dbStore.getAdminStats();
  return res.json({ success: true, stats });
});

// Manage Sellers
adminRouter.get('/sellers', (_req, res: Response) => {
  const shops = dbStore.getShops();
  const users = dbStore.getUsers().filter((u) => u.role === 'seller');

  const userMap = new Map(users.map((u) => [u.id, u]));

  const enriched = shops.map((s) => {
    const owner = userMap.get(s.ownerId);
    const prodCount = dbStore.getProducts().filter((p) => p.vendorId === s.id).length;
    const orderCount = dbStore.getOrders().filter((o) => o.vendorId === s.id).length;
    return {
      ...s,
      ownerName: owner?.name || 'Seller',
      ownerEmail: owner?.email,
      productCount: prodCount,
      orderCount,
    };
  });

  return res.json({ success: true, count: enriched.length, sellers: enriched });
});

// Verify / Approve / Reject / Suspend Seller
adminRouter.put('/sellers/:id/verify', (req: AuthenticatedRequest, res: Response) => {
  const shop = dbStore.getShopById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

  const { status, notes } = req.body; // 'verified' | 'rejected' | 'suspended' | 'pending'
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  const updated = dbStore.updateShop(shop.id, {
    verificationStatus: status,
    verificationNotes: notes || `Updated by Administrator to ${status}`,
  });

  // Notify seller
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'seller',
    recipientId: shop.id,
    title: `Store Verification Status: ${status.toUpperCase()}`,
    kannadaTitle: `ಅಂಗಡಿ ಪರಿಶೀಲನೆ ಸ್ಥಿತಿ`,
    message: notes || `Your store verification status has been updated to ${status}.`,
    type: 'system',
    linkId: shop.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  dbStore.createAuditLog({
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: 'admin',
    action: 'VERIFY_SELLER',
    targetType: 'shop',
    targetId: shop.id,
    details: `Updated verification status to ${status}. Notes: ${notes || 'None'}`,
  });

  return res.json({ success: true, shop: updated });
});

// Moderation: List all listings & toggle suspicious flag
adminRouter.get('/listings', (_req, res: Response) => {
  const products = dbStore.getProducts();
  return res.json({ success: true, count: products.length, products });
});

adminRouter.put('/listings/:id/flag', (req: AuthenticatedRequest, res: Response) => {
  const prod = dbStore.getProductById(req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

  const { isSuspicious } = req.body;
  const updated = dbStore.updateProduct(prod.id, {
    isSuspicious: Boolean(isSuspicious),
  });

  dbStore.createAuditLog({
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: 'admin',
    action: isSuspicious ? 'FLAG_PRODUCT_SUSPICIOUS' : 'UNFLAG_PRODUCT',
    targetType: 'policy',
    targetId: prod.id,
    details: `Product "${prod.name}" flagged suspicious = ${Boolean(isSuspicious)}`,
  });

  return res.json({ success: true, product: updated });
});

// Dispute Resolution Center
adminRouter.get('/disputes', (_req, res: Response) => {
  const disputes = dbStore.getDisputes();
  return res.json({ success: true, count: disputes.length, disputes });
});

adminRouter.put('/disputes/:id/resolve', (req: AuthenticatedRequest, res: Response) => {
  const dispute = dbStore.getDisputeById(req.params.id);
  if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

  const { decision, status, action } = req.body; // status: 'resolved' | 'dismissed', action: 'refund' | 'close'
  if (!decision) return res.status(400).json({ success: false, message: 'Decision statement is required' });

  const resolved = dbStore.updateDispute(dispute.id, {
    status: status || 'resolved',
    adminDecision: decision,
    resolvedAt: new Date().toISOString(),
  });

  // If dispute relates to a return and admin chose to refund
  if (dispute.returnId && action === 'refund') {
    const ret = dbStore.getReturnById(dispute.returnId);
    if (ret) {
      const refundTxId = `REFUND-ADMIN-${Date.now().toString().slice(-6)}`;
      dbStore.updateReturn(ret.id, {
        status: 'refunded',
        adminNotes: `Refund mandated by Administrator dispute resolution: ${decision}`,
        refundTransactionId: refundTxId,
        refundStatus: 'successful',
        resolvedAt: new Date().toISOString(),
      });

      // Restore inventory
      dbStore.restoreStock(ret.productId, ret.quantity);

      // Create refund transaction
      dbStore.createRefundTransaction({
        id: `ref-tx-${Date.now()}`,
        orderId: ret.orderId,
        returnId: ret.id,
        amount: ret.refundAmount,
        status: 'successful',
        gatewayRefundId: refundTxId,
        reason: `Admin dispute resolution: ${decision}`,
        initiatedBy: `${req.user!.name} (Admin)`,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      });
    }
  }

  // Notify customer
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'customer',
    recipientId: dispute.customerId,
    title: `Dispute Resolved: ${dispute.id}`,
    kannadaTitle: `ವಿವಾದ ಇತ್ಯರ್ಥಗೊಂಡಿದೆ`,
    message: `Admin decision: ${decision}`,
    type: 'dispute',
    linkId: dispute.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Notify seller
  dbStore.createNotification({
    id: `notif-${Date.now() + 1}`,
    recipientRole: 'seller',
    recipientId: dispute.vendorId,
    title: `Dispute Closed: ${dispute.id}`,
    kannadaTitle: `ವಿವಾದ ಮುಕ್ತಾಯಗೊಂಡಿದೆ`,
    message: `Admin decision on dispute: ${decision}`,
    type: 'dispute',
    linkId: dispute.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  dbStore.createAuditLog({
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: 'admin',
    action: 'RESOLVE_DISPUTE',
    targetType: 'dispute',
    targetId: dispute.id,
    details: `Dispute resolved. Decision: "${decision}", Action: ${action || 'close'}`,
  });

  return res.json({ success: true, dispute: resolved });
});

// Reviews Moderation Queue
adminRouter.get('/reviews/reported', (_req, res: Response) => {
  const reported = dbStore.getReviews().filter((r) => r.status === 'reported');
  return res.json({ success: true, count: reported.length, reviews: reported });
});

adminRouter.put('/reviews/:id/moderate', (req: AuthenticatedRequest, res: Response) => {
  const { action } = req.body; // 'keep' | 'hide' | 'dismiss'
  if (!action || !['keep', 'hide', 'dismiss'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be keep, hide, or dismiss' });
  }

  const moderated = dbStore.moderateReview(req.params.id, action);
  if (!moderated) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  dbStore.createAuditLog({
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: 'admin',
    action: `MODERATE_REVIEW_${action.toUpperCase()}`,
    targetType: 'review',
    targetId: moderated.id,
    details: `Review for product "${moderated.productName}" moderated with action: ${action}`,
  });

  return res.json({ success: true, review: moderated });
});

// Administrative Audit Logs
adminRouter.get('/audit-logs', (_req, res: Response) => {
  const logs = dbStore.getAuditLogs();
  return res.json({ success: true, count: logs.length, logs });
});

// Financial Transactions Overview (Payments & Refunds monitoring)
adminRouter.get('/financials', (_req, res: Response) => {
  const payments = dbStore.getPaymentTransactions();
  const refunds = dbStore.getRefundTransactions();
  return res.json({
    success: true,
    payments,
    refunds,
  });
});

// Promotional Banners
adminRouter.get('/banners', (_req, res: Response) => {
  const banners = dbStore.getBanners();
  return res.json({ success: true, count: banners.length, banners });
});

adminRouter.post('/banners', (req: AuthenticatedRequest, res: Response) => {
  const { title, kannadaTitle, subtitle, badge, image, linkCategory, active } = req.body;
  if (!title || !subtitle || !image) {
    return res.status(400).json({ success: false, message: 'Title, subtitle, and image are required' });
  }

  const newBanner: PromotionalBanner = {
    id: `banner-${Date.now()}`,
    title,
    kannadaTitle: kannadaTitle || title,
    subtitle,
    badge: badge || 'Featured',
    image,
    linkCategory,
    active: active !== undefined ? Boolean(active) : true,
  };

  dbStore.createBanner(newBanner);
  return res.status(201).json({ success: true, banner: newBanner });
});

adminRouter.put('/banners/:id', (req: AuthenticatedRequest, res: Response) => {
  const updated = dbStore.updateBanner(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Banner not found' });
  return res.json({ success: true, banner: updated });
});
