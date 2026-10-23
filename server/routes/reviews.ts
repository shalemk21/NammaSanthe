import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { Review } from '../types';

export const reviewsRouter = Router();

// Get reviews (filter by product or vendor; hide reported/hidden ones unless admin)
reviewsRouter.get('/', (req, res: Response) => {
  const { productId, vendorId, includeHidden } = req.query;
  let reviews = dbStore.getReviews();

  if (productId && typeof productId === 'string') {
    reviews = reviews.filter((r) => r.productId === productId);
  }
  if (vendorId && typeof vendorId === 'string') {
    reviews = reviews.filter((r) => r.vendorId === vendorId);
  }

  // Filter out hidden reviews for regular public viewing
  if (includeHidden !== 'true') {
    reviews = reviews.filter((r) => r.status !== 'hidden');
  }

  return res.json({ success: true, count: reviews.length, reviews });
});

// Post review (Customer with verified purchase ONLY)
reviewsRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { productId, rating, comment } = req.body;

  if (!productId || rating === undefined) {
    return res.status(400).json({ success: false, message: 'Product ID and rating (1-5) are required' });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
  }

  const product = dbStore.getProductById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Sellers cannot review their own shop products
  if (req.user?.role === 'seller' && req.user.shopId === product.vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Sellers are strictly forbidden from rating or reviewing their own products',
    });
  }

  // Strictly enforce verified purchase: Customer must have a delivered/completed order with this product
  const completedOrders = dbStore
    .getOrders()
    .filter(
      (o) =>
        o.customerId === req.user?.id &&
        (o.status === 'delivered' || o.status === 'picked_up')
    );

  const matchingOrder = completedOrders.find((o) =>
    o.items.some((i) => i.productId === productId)
  );

  if (!matchingOrder) {
    return res.status(403).json({
      success: false,
      message:
        'Verified Purchase Required: Only customers who have purchased and received this product can submit a review.',
    });
  }

  // Check for duplicate review by same customer on same product
  const existingReview = dbStore
    .getReviews()
    .find((r) => r.productId === productId && r.customerId === req.user?.id);

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product. Please use the edit option to update your review.',
      existingReviewId: existingReview.id,
    });
  }

  const review: Review = {
    id: `rev-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    vendorId: product.vendorId,
    customerId: req.user!.id,
    customerName: req.user!.name,
    rating: numRating,
    comment: comment || 'Verified purchase review',
    verifiedPurchase: true,
    orderId: matchingOrder.id,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  dbStore.createReview(review);

  // Notify seller of review
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'seller',
    recipientId: product.vendorId,
    title: `New ${numRating}★ Review for ${product.name}`,
    kannadaTitle: `ಹೊಸ ರೇಟಿಂಗ್ ಮತ್ತು ವಿಮರ್ಶೆ`,
    message: `${req.user?.name} rated "${product.name}" ${numRating} stars: "${comment?.slice(0, 60) || 'Verified rating'}"`,
    type: 'system',
    linkId: product.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ success: true, review });
});

// Edit existing review (Customer owner only)
reviewsRouter.put('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const review = dbStore.getReviewById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  if (review.customerId !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized to edit this review' });
  }

  const { rating, comment } = req.body;
  const updates: Partial<Review> = {};
  if (rating !== undefined) {
    const num = Number(rating);
    if (num >= 1 && num <= 5) updates.rating = num;
  }
  if (comment !== undefined) updates.comment = comment;

  const updated = dbStore.updateReview(review.id, updates);
  return res.json({ success: true, review: updated });
});

// Delete review (Customer owner or Admin only)
reviewsRouter.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const review = dbStore.getReviewById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  if (review.customerId !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this review' });
  }

  const deleted = dbStore.deleteReview(review.id);
  return res.json({ success: deleted, message: 'Review deleted and ratings recalculated' });
});

// Report review as inappropriate
reviewsRouter.post('/:id/report', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ success: false, message: 'Report reason is required' });
  }

  const reported = dbStore.reportReview(req.params.id, reason, `${req.user!.name} (${req.user!.role})`);
  if (!reported) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  // Notify admin
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'admin',
    recipientId: 'u-admin-1',
    title: 'Review Reported for Moderation',
    kannadaTitle: 'ವಿಮರ್ಶೆಯನ್ನು ವರದಿ ಮಾಡಲಾಗಿದೆ',
    message: `Review #${reported.id} for "${reported.productName}" was reported: "${reason}".`,
    type: 'system',
    linkId: reported.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: 'Review reported successfully. Our administration team will review it.',
  });
});
