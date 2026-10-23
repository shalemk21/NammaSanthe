import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { Order, OrderItemSnapshot } from '../types';

export const ordersRouter = Router();

// Create new order (Checkout)
ordersRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, deliveryAddress, deliverySlot, paymentMethod, deliveryLocality, deliveryPincode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    const orderItemSnapshots: OrderItemSnapshot[] = [];
    let subtotal = 0;
    let mainVendorId = '';
    let mainVendorName = '';

    // Step 1: Validate stock for all items before any deduction
    for (const item of items) {
      const product = dbStore.getProductById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} was not found`,
        });
      }

      if (product.stockCount < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stockCount}, Requested: ${item.quantity}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      if (!mainVendorId) {
        mainVendorId = product.vendorId;
        mainVendorName = product.vendorName;
      }

      orderItemSnapshots.push({
        productId: product.id,
        name: product.name,
        kannadaName: product.kannadaName,
        image: product.image,
        unit: product.unit,
        priceSnapshot: product.price,
        quantity: item.quantity,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
      });
    }

    // Step 2: Atomic inventory decrement
    for (const item of items) {
      const reserved = dbStore.reserveAndDecrementStock(item.productId, item.quantity);
      if (!reserved) {
        return res.status(400).json({
          success: false,
          message: 'Error reserving inventory. Please try again.',
        });
      }
    }

    const deliveryFee = subtotal > 300 ? 0 : 35;
    const discount = subtotal > 500 ? 50 : 0;
    const ecoPackagingFee = 5;
    const totalAmount = subtotal + deliveryFee + ecoPackagingFee - discount;

    const orderId = `NS-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: orderId,
      customerId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      vendorId: mainVendorId || 'v1',
      vendorName: mainVendorName || 'Local Vendor',
      createdAt: new Date().toISOString(),
      items: orderItemSnapshots,
      subtotal,
      deliveryFee,
      discount,
      ecoPackagingFee,
      totalAmount,
      status: 'confirmed',
      deliveryAddress,
      deliveryLocality: deliveryLocality || 'Malleshwaram',
      deliveryPincode: deliveryPincode || '560003',
      deliverySlot: deliverySlot || 'Today within 90 mins',
      paymentMethod: paymentMethod || 'UPI (Instant Demo Gateway)',
      paymentStatus: 'paid',
      paymentTransactionId: `TXN-DEMO-${Date.now().toString().slice(-6)}`,
      estimatedDelivery: 'Today within 60-90 mins',
      deliveryAgent: {
        name: 'Santhe Express Rider',
        phone: '+91 98450 11223',
        vehicle: 'Eco Electric Scooter (KA-04-EV-2026)',
      },
      trackingSteps: [
        {
          step: 'Order Confirmed',
          kannadaStep: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
          time: currentTimeStr,
          completed: true,
          current: false,
          description: `Order verified and accepted by ${mainVendorName || 'Local Store'}. Stock reserved.`,
        },
        {
          step: 'Packing at Local Store',
          kannadaStep: 'ಸ್ಥಳೀಯ ಅಂಗಡಿಯಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ',
          time: 'Next step',
          completed: false,
          current: true,
          description: 'Store assistant is carefully assembling your fresh items.',
        },
        {
          step: 'Out for Local Delivery',
          kannadaStep: 'ವಿತರಣೆಗೆ ಹೊರಟಿದೆ',
          time: 'Upcoming',
          completed: false,
          current: false,
          description: 'Delivery partner will pick up and head to your doorstep.',
        },
        {
          step: 'Delivered to Doorstep',
          kannadaStep: 'ಮನೆಬಾಗಿಲಿಗೆ ತಲುಪಿಸಲಾಗಿದೆ',
          time: 'Upcoming',
          completed: false,
          current: false,
          description: 'Package handed over with eco-bag.',
        },
      ],
    };

    dbStore.createOrder(newOrder);

    // Notify customer
    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      recipientRole: 'customer',
      recipientId: req.user!.id,
      title: 'Order Placed Successfully!',
      kannadaTitle: 'ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಇರಿಸಲಾಗಿದೆ!',
      message: `Your order #${orderId} for ₹${totalAmount} has been confirmed.`,
      type: 'order',
      linkId: orderId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Notify seller
    dbStore.createNotification({
      id: `notif-${Date.now() + 1}`,
      recipientRole: 'seller',
      recipientId: mainVendorId,
      title: 'New Customer Order Received',
      kannadaTitle: 'ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ',
      message: `New order #${orderId} received from ${req.user!.name} for ₹${totalAmount}.`,
      type: 'order',
      linkId: orderId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order created and stock successfully reserved',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Error processing order' });
  }
});

// List orders
ordersRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { status, vendorId } = req.query;
  let orders = dbStore.getOrders();

  // Role based filtering
  if (req.user?.role === 'customer') {
    orders = orders.filter((o) => o.customerId === req.user?.id);
  } else if (req.user?.role === 'seller') {
    const sId = vendorId && typeof vendorId === 'string' ? vendorId : req.user.shopId;
    orders = orders.filter((o) => o.vendorId === sId);
  }
  // Admin sees all

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  return res.json({ success: true, count: orders.length, orders });
});

// Get order details
ordersRouter.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Authorization check
  if (
    req.user?.role === 'customer' &&
    order.customerId !== req.user.id
  ) {
    return res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
  }
  if (
    req.user?.role === 'seller' &&
    order.vendorId !== req.user.shopId
  ) {
    return res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
  }

  return res.json({ success: true, order });
});

// Update fulfillment status (Seller or Admin)
ordersRouter.put('/:id/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (req.user?.role !== 'admin' && req.user?.shopId !== order.vendorId) {
    return res.status(403).json({ success: false, message: 'Unauthorized to update this order' });
  }

  const { status, note, kannadaNote } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  const updated = dbStore.updateOrderStatus(order.id, status, note, kannadaNote);

  // Notify customer of delivery progress
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'customer',
    recipientId: order.customerId,
    title: `Order #${order.id} Update: ${status.toUpperCase()}`,
    kannadaTitle: `ಆರ್ಡರ್ #${order.id} ವಿವರ`,
    message: note || `Your order status changed to ${status}.`,
    type: 'delivery',
    linkId: order.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, order: updated });
});

// Cancel order
ordersRouter.post('/:id/cancel', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (
    req.user?.role === 'customer' &&
    order.customerId !== req.user.id
  ) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  if (
    req.user?.role === 'seller' &&
    order.vendorId !== req.user.shopId
  ) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  if (order.status === 'delivered') {
    return res.status(400).json({
      success: false,
      message: 'Delivered orders cannot be cancelled. Please submit a Return Request instead.',
    });
  }

  if (order.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Order is already cancelled' });
  }

  const { reason } = req.body;
  const cancellationReason = reason || 'Customer requested cancellation';

  const cancelled = dbStore.cancelOrder(order.id, cancellationReason);

  // Notify seller
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'seller',
    recipientId: order.vendorId,
    title: `Order #${order.id} Cancelled`,
    kannadaTitle: `ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ`,
    message: `Order #${order.id} was cancelled. Reserved inventory was automatically returned to your stock.`,
    type: 'order',
    linkId: order.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    order: cancelled,
    message: 'Order cancelled successfully and stock restored',
  });
});
