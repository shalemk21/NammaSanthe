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
      dbStore.updateReturn(ret.id, {
        status: 'refunded',
        adminNotes: `Refund mandated by Administrator dispute resolution: ${decision}`,
        refundTransactionId: `REFUND-ADMIN-${Date.now().toString().slice(-6)}`,
        resolvedAt: new Date().toISOString(),
      });
      // Restore inventory
      dbStore.restoreStock(ret.productId, ret.quantity);
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

  return res.json({ success: true, dispute: resolved });
});

// Promotional Banners & Policies
adminRouter.get('/banners', (_req, res: Response) => {
  const banners = dbStore.getBanners();
  return res.json({ success: true, banners });
});

adminRouter.post('/banners', (req: AuthenticatedRequest, res: Response) => {
  const { title, kannadaTitle, subtitle, badge, image, linkCategory } = req.body;
  if (!title || !image) {
    return res.status(400).json({ success: false, message: 'Title and image are required' });
  }

  const banner: PromotionalBanner = {
    id: `b-${Date.now()}`,
    title,
    kannadaTitle: kannadaTitle || title,
    subtitle: subtitle || 'Special curated offers',
    badge: badge || 'Promotion',
    image,
    linkCategory,
    active: true,
  };

  dbStore.createBanner(banner);
  return res.status(201).json({ success: true, banner });
});

adminRouter.put('/banners/:id', (req: AuthenticatedRequest, res: Response) => {
  const { active, title, subtitle, badge, image } = req.body;
  const updated = dbStore.updateBanner(req.params.id, {
    ...(active !== undefined ? { active: Boolean(active) } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(subtitle !== undefined ? { subtitle } : {}),
    ...(badge !== undefined ? { badge } : {}),
    ...(image !== undefined ? { image } : {}),
  });

  return res.json({ success: true, banner: updated });
});
