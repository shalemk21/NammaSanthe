import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { Review } from '../types';

export const reviewsRouter = Router();

// Get reviews (by product or vendor)
reviewsRouter.get('/', (req, res: Response) => {
  const { productId, vendorId } = req.query;
  let reviews = dbStore.getReviews();

  if (productId && typeof productId === 'string') {
    reviews = reviews.filter((r) => r.productId === productId);
  }
  if (vendorId && typeof vendorId === 'string') {
    reviews = reviews.filter((r) => r.vendorId === vendorId);
  }

  return res.json({ success: true, count: reviews.length, reviews });
});

// Post review (Customer after purchase)
reviewsRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    return res.status(400).json({ success: false, message: 'Product ID and rating are required' });
  }

  const product = dbStore.getProductById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Check if customer purchased this product
  const customerOrders = dbStore
    .getOrders()
    .filter((o) => o.customerId === req.user?.id && o.status === 'delivered');

  const hasPurchased = customerOrders.some((o) =>
    o.items.some((i) => i.productId === productId)
  );

  const review: Review = {
    id: `rev-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    vendorId: product.vendorId,
    customerId: req.user!.id,
    customerName: req.user!.name,
    rating: Number(rating),
    comment: comment || 'Great quality fresh local product!',
    verifiedPurchase: hasPurchased,
    createdAt: new Date().toISOString(),
  };

  dbStore.createReview(review);

  // Notify seller of review
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'seller',
    recipientId: product.vendorId,
    title: `New ${rating}★ Review for ${product.name}`,
    kannadaTitle: `ಹೊಸ ರೇಟಿಂಗ್ ಮತ್ತು ವಿಮರ್ಶೆ`,
    message: `${req.user?.name} rated "${product.name}" ${rating} stars: "${comment?.slice(0, 60) || 'Good'}"`,
    type: 'system',
    linkId: product.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ success: true, review });
});
