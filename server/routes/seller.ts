import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const sellerRouter = Router();

// Get live computed seller analytics
sellerRouter.get('/analytics', authenticate, requireRole('seller', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const shopId = (req.query.vendorId as string) || req.user?.shopId;
  if (!shopId) {
    return res.status(400).json({ success: false, message: 'Vendor shop ID required' });
  }

  const shop = dbStore.getShopById(shopId);
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  const analytics = dbStore.getSellerAnalytics(shopId);

  return res.json({
    success: true,
    shop,
    metrics: analytics,
  });
});

// Quick live stock adjustment
sellerRouter.put('/inventory/:productId', authenticate, requireRole('seller'), (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const { stockCount } = req.body;

  const product = dbStore.getProductById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  if (product.vendorId !== req.user?.shopId && req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const updatedStock = Number(stockCount);
  const updated = dbStore.updateProduct(productId, {
    stockCount: updatedStock,
    inStock: updatedStock > 0,
  });

  return res.json({ success: true, product: updated });
});
