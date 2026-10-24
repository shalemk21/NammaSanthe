import { Router, Response } from 'express';
import crypto from 'crypto';
import { dbStore } from '../dbStore';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { Order, OrderItemSnapshot, FulfillmentType } from '../types';

export const ordersRouter = Router();

// Create new order (supports Single-Shop and Multi-Shop Checkout, Delivery vs In-Store Pickup, and Razorpay/COD)
ordersRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      items,
      fulfillmentType = 'delivery',
      deliveryAddress,
      deliverySlot,
      pickupSlot,
      paymentMethod = 'UPI',
      deliveryLocality,
      deliveryPincode,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      couponCode,
      couponDiscount,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    const isPickup = fulfillmentType === 'pickup';

    if (!isPickup && !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required for home delivery' });
    }

    const cleanPincode = (deliveryPincode || '').toString().trim();
    if (!isPickup && !cleanPincode) {
      return res.status(400).json({ success: false, message: 'Valid delivery PIN code is required' });
    }

    // Group items by vendor to support multi-shop orders cleanly
    const itemsByVendor: Record<string, { productId: string; quantity: number }[]> = {};
    for (const item of items) {
      const prod = dbStore.getProductById(item.productId);
      if (!prod) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} was not found in catalog`,
        });
      }
      if (prod.stockCount < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Available: ${prod.stockCount}, Requested: ${item.quantity}`,
        });
      }
      if (!itemsByVendor[prod.vendorId]) {
        itemsByVendor[prod.vendorId] = [];
      }
      itemsByVendor[prod.vendorId].push(item);
    }

    // Calculate total order produce subtotal across all vendors
    const overallCartSubtotal = items.reduce((sum, it) => {
      const p = dbStore.getProductById(it.productId);
      return sum + (p ? p.price * it.quantity : 0);
    }, 0);

    // Validate delivery PIN code & minimum order value per vendor
    const vendorIds = Object.keys(itemsByVendor);
    for (const vId of vendorIds) {
      const shop = dbStore.getShopById(vId);
      if (!shop) {
        return res.status(400).json({ success: false, message: `Store with ID ${vId} not found` });
      }

      // Check PIN code serviceability for delivery
      if (!isPickup) {
        const isServiceable = dbStore.isPincodeServiceable(vId, cleanPincode);
        if (!isServiceable) {
          return res.status(400).json({
            success: false,
            message: `Delivery to PIN code ${cleanPincode} is not supported by "${shop.name}". Please choose In-Store Pickup or select an address within their service area.`,
            unsupportedShop: shop.name,
            serviceablePincodes: shop.serviceablePincodes || [],
          });
        }
      }

      // Check minimum order value for this vendor
      const vendorSubtotal = itemsByVendor[vId].reduce((sum, it) => {
        const p = dbStore.getProductById(it.productId)!;
        return sum + p.price * it.quantity;
      }, 0);

      const minVal = shop.minOrderValue || 0;
      const vendorDelivery = isPickup ? 0 : (vendorSubtotal >= (shop.freeDeliveryThreshold || 350) ? 0 : (shop.deliveryCharge || 35));
      const vendorEco = isPickup ? 0 : 5;
      const vendorBillTotal = vendorSubtotal + vendorDelivery + vendorEco;
      const overallCartBill = overallCartSubtotal + (isPickup ? 0 : 35) + (isPickup ? 0 : 5);

      // The minimum order requirement is satisfied if:
      // 1. The vendor produce subtotal >= minVal (e.g. ₹99), OR
      // 2. The vendor bill total (items + delivery + eco) >= minVal (e.g. ₹88 + ₹35 + ₹5 = ₹128 >= ₹99), OR
      // 3. The overall cart produce subtotal >= minVal, OR
      // 4. The overall final bill >= minVal
      const isSatisfied = 
        vendorSubtotal >= minVal ||
        vendorBillTotal >= minVal ||
        overallCartSubtotal >= minVal ||
        overallCartBill >= minVal;

      if (!isSatisfied) {
        const currentPayable = Math.max(vendorBillTotal, vendorSubtotal);
        return res.status(400).json({
          success: false,
          message: `Minimum order value for "${shop.name}" is ₹${minVal}. Your current bill total is ₹${currentPayable}. Please add ₹${minVal - currentPayable} more items.`,
        });
      }

      // Check COD availability if payment method is COD
      const isCod = paymentMethod.toUpperCase().includes('COD') || paymentMethod.toUpperCase().includes('CASH');
      if (isCod && shop.allowCod === false) {
        return res.status(400).json({
          success: false,
          message: `Cash on Delivery (COD) is not accepted by "${shop.name}". Please choose an online payment method.`,
        });
      }
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

    // Check payment status
    const isCod = paymentMethod.toUpperCase().includes('COD') || paymentMethod.toUpperCase().includes('CASH');
    const paymentStatus: Order['paymentStatus'] = isCod ? 'pending' : 'paid';
    const txnId = razorpay_payment_id || (isCod ? `COD-PENDING-${Date.now().toString().slice(-6)}` : `TXN-DEMO-${Date.now().toString().slice(-6)}`);

    const parentOrderId = vendorIds.length > 1 ? `NS-MULTI-${Math.floor(1000 + Math.random() * 9000)}` : undefined;
    const createdOrders: Order[] = [];
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 3: Create order per vendor
    vendorIds.forEach((vId, index) => {
      const shop = dbStore.getShopById(vId)!;
      const vendorItems = itemsByVendor[vId];

      const orderItemSnapshots: OrderItemSnapshot[] = [];
      let subtotal = 0;

      for (const it of vendorItems) {
        const p = dbStore.getProductById(it.productId)!;
        subtotal += p.price * it.quantity;
        orderItemSnapshots.push({
          productId: p.id,
          name: p.name,
          kannadaName: p.kannadaName,
          image: p.image,
          unit: p.unit,
          priceSnapshot: p.price,
          quantity: it.quantity,
          vendorId: p.vendorId,
          vendorName: p.vendorName,
        });
      }

      // Delivery Fee calculation
      let deliveryFee = 0;
      if (!isPickup) {
        const freeThreshold = shop.freeDeliveryThreshold || 350;
        deliveryFee = subtotal >= freeThreshold ? 0 : (shop.deliveryCharge || 35);
      }

      // Calculate discount from coupon or fallback
      let discount = 0;
      if (couponCode) {
        const cleanCode = couponCode.toString().trim().toUpperCase();
        if (cleanCode === 'SANTHE25') {
          discount = Math.min(50, Math.round(subtotal * 0.25));
        } else if (cleanCode === 'FARM50') {
          discount = subtotal >= 300 ? 50 : 0;
        } else if (cleanCode === 'HARVEST10') {
          discount = Math.min(100, Math.round(subtotal * 0.10));
        } else if (cleanCode === 'NAMMAFREEDEL' || cleanCode === 'SANTHEFREE') {
          discount = deliveryFee;
        } else if (typeof couponDiscount === 'number' && couponDiscount > 0) {
          if (vendorIds.length > 1 && overallCartSubtotal > 0) {
            discount = Math.round(couponDiscount * (subtotal / overallCartSubtotal));
          } else {
            discount = Math.min(subtotal, couponDiscount);
          }
        }
      } else if (typeof couponDiscount === 'number' && couponDiscount > 0) {
        if (vendorIds.length > 1 && overallCartSubtotal > 0) {
          discount = Math.round(couponDiscount * (subtotal / overallCartSubtotal));
        } else {
          discount = Math.min(subtotal, couponDiscount);
        }
      } else {
        discount = subtotal > 500 ? 50 : 0;
      }

      const ecoPackagingFee = isPickup ? 0 : 5;
      const totalAmount = Math.max(0, subtotal + deliveryFee + ecoPackagingFee - discount);

      const subOrderSuffix = vendorIds.length > 1 ? `-${String.fromCharCode(65 + index)}` : '';
      const orderId = parentOrderId ? `${parentOrderId}${subOrderSuffix}` : `NS-${Math.floor(1000 + Math.random() * 9000)}`;

      const trackingSteps = isPickup
        ? [
            {
              step: 'Order Confirmed',
              kannadaStep: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
              time: currentTimeStr,
              completed: true,
              current: false,
              description: `Store pickup order accepted by ${shop.name}. Stock reserved.`,
            },
            {
              step: 'Store Assembling Harvest',
              kannadaStep: 'ಅಂಗಡಿಯಲ್ಲಿ ವಸ್ತುಗಳನ್ನು ಜೋಡಿಸಲಾಗುತ್ತಿದೆ',
              time: 'Next step',
              completed: false,
              current: true,
              description: `Preparing your items for in-store pickup (Est. ${shop.estimatedPrepTimeMinutes || 30} mins).`,
            },
            {
              step: 'Ready for Store Pickup',
              kannadaStep: 'ಅಂಗಡಿಯಲ್ಲಿ ಪಡೆಯಲು ಸಿದ್ಧವಾಗಿದೆ',
              time: 'Upcoming',
              completed: false,
              current: false,
              description: `Pickup counter ready at ${shop.location}. Please show Order #${orderId}.`,
            },
            {
              step: 'Picked Up by Customer',
              kannadaStep: 'ಗ್ರಾಹಕರು ಪಡೆದುಕೊಂಡಿದ್ದಾರೆ',
              time: 'Upcoming',
              completed: false,
              current: false,
              description: 'Order handed over at store counter.',
            },
          ]
        : [
            {
              step: 'Order Confirmed',
              kannadaStep: 'ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
              time: currentTimeStr,
              completed: true,
              current: false,
              description: `Order accepted by ${shop.name}. Stock reserved.`,
            },
            {
              step: 'Packing at Local Store',
              kannadaStep: 'ಸ್ಥಳೀಯ ಅಂಗಡಿಯಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ',
              time: 'Next step',
              completed: false,
              current: true,
              description: `Store assistant is packing your fresh items (Est. prep: ${shop.estimatedPrepTimeMinutes || 30} mins).`,
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
          ];

      const newOrder: Order = {
        id: orderId,
        parentOrderId,
        customerId: req.user!.id,
        customerName: req.user!.name,
        customerEmail: req.user!.email,
        customerPhone: req.user!.phone || '+91 98450 99887',
        vendorId: shop.id,
        vendorName: shop.name,
        createdAt: new Date().toISOString(),
        items: orderItemSnapshots,
        subtotal,
        deliveryFee,
        discount,
        couponCode: couponCode ? couponCode.toString().trim().toUpperCase() : undefined,
        ecoPackagingFee,
        totalAmount,
        fulfillmentType: isPickup ? 'pickup' : 'delivery',
        pickupSlot: isPickup ? (pickupSlot || 'Today within 60-90 mins') : undefined,
        status: 'confirmed',
        deliveryAddress: isPickup ? `In-Store Pickup Counter @ ${shop.name}, ${shop.location}` : deliveryAddress,
        deliveryLocality: isPickup ? shop.locality : (deliveryLocality || 'Malleshwaram'),
        deliveryPincode: isPickup ? shop.pincode : cleanPincode,
        deliverySlot: isPickup ? (pickupSlot || 'Ready for pickup in 45 mins') : (deliverySlot || 'Today within 90 mins'),
        paymentMethod,
        paymentStatus,
        paymentTransactionId: txnId,
        paymentGatewayOrderId: razorpay_order_id,
        paymentSignature: razorpay_signature,
        refundStatus: 'none',
        estimatedDelivery: isPickup ? `Ready for pickup in ~${shop.estimatedPrepTimeMinutes || 30} mins` : 'Today within 60-90 mins',
        deliveryAgent: isPickup
          ? undefined
          : {
              name: 'Santhe Express Rider',
              phone: '+91 98450 11223',
              vehicle: 'Eco Electric Scooter (KA-04-EV-2026)',
            },
        trackingSteps,
      };

      dbStore.createOrder(newOrder);
      createdOrders.push(newOrder);

      // Notify customer
      dbStore.createNotification({
        id: `notif-${Date.now()}-${index}`,
        recipientRole: 'customer',
        recipientId: req.user!.id,
        title: isPickup ? 'Pickup Order Confirmed!' : 'Order Placed Successfully!',
        kannadaTitle: isPickup ? 'ಪಿಕಪ್ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!' : 'ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಇರಿಸಲಾಗಿದೆ!',
        message: isPickup
          ? `Your in-store pickup order #${orderId} at ${shop.name} is confirmed for ₹${totalAmount}.`
          : `Your order #${orderId} from ${shop.name} for ₹${totalAmount} has been confirmed.`,
        type: 'order',
        linkId: orderId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Notify seller
      dbStore.createNotification({
        id: `notif-${Date.now() + 10}-${index}`,
        recipientRole: 'seller',
        recipientId: shop.id,
        title: isPickup ? 'New Store Pickup Order' : 'New Customer Order Received',
        kannadaTitle: isPickup ? 'ಹೊಸ ಪಿಕಪ್ ಆರ್ಡರ್' : 'ಹೊಸ ಗ್ರಾಹಕರ ಆರ್ಡರ್',
        message: `Order #${orderId} (${isPickup ? 'Store Pickup' : 'Home Delivery'}) received from ${req.user!.name} for ₹${totalAmount}.`,
        type: 'order',
        linkId: orderId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    // Create Audit Log
    dbStore.createAuditLog({
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      action: 'CREATE_ORDER',
      targetType: 'order',
      targetId: createdOrders[0].id,
      details: `Created ${createdOrders.length} order(s). Fulfillment: ${fulfillmentType}, Method: ${paymentMethod}, Total: ₹${createdOrders.reduce((s, o) => s + o.totalAmount, 0)}`,
    });

    return res.status(201).json({
      success: true,
      order: createdOrders[0], // Main / first order for direct view
      orders: createdOrders,
      parentOrderId,
      isMultiShop: createdOrders.length > 1,
      message: `${createdOrders.length} order(s) created and stock successfully reserved.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Error processing order' });
  }
});

// List orders (with role authorization & filtering)
ordersRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { status, vendorId, fulfillmentType, paymentStatus } = req.query;
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

  if (fulfillmentType && typeof fulfillmentType === 'string' && fulfillmentType !== 'all') {
    orders = orders.filter((o) => o.fulfillmentType === fulfillmentType);
  }

  if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }

  return res.json({ success: true, count: orders.length, orders });
});

// Get order details
ordersRouter.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Authorization check
  if (req.user?.role === 'customer' && order.customerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
  }
  if (req.user?.role === 'seller' && order.vendorId !== req.user.shopId) {
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

  const { status, note, kannadaNote, trackingReference } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  // Disallow invalid backwards transitions from terminal states
  if (order.status === 'delivered' || order.status === 'picked_up' || order.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: `Cannot change status of an order that is already ${order.status}`,
    });
  }

  const updated = dbStore.updateOrderStatus(order.id, status, note, kannadaNote, trackingReference);

  // Notify customer of delivery or pickup progress
  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'customer',
    recipientId: order.customerId,
    title: `Order #${order.id} Update: ${status.replace('_', ' ').toUpperCase()}`,
    kannadaTitle: `ಆರ್ಡರ್ #${order.id} ಸ್ಥಿತಿ ನವೀಕರಣ`,
    message: note || (trackingReference ? `Order status changed to ${status}. Tracking Reference: ${trackingReference}` : `Your order status changed to ${status}.`),
    type: 'delivery',
    linkId: order.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Create Audit Log
  dbStore.createAuditLog({
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: req.user!.role,
    action: 'UPDATE_ORDER_STATUS',
    targetType: 'order',
    targetId: order.id,
    details: `Status changed from ${order.status} to ${status}. Tracking Ref: ${trackingReference || 'None'}`,
  });

  return res.json({ success: true, order: updated });
});

// Cancel order (Customer, Seller, or Admin)
ordersRouter.post('/:id/cancel', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Authorization check
  const isCustomerOwner = req.user?.role === 'customer' && order.customerId === req.user.id;
  const isSellerOwner = req.user?.role === 'seller' && order.vendorId === req.user.shopId;
  const isAdmin = req.user?.role === 'admin';

  if (!isCustomerOwner && !isSellerOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order' });
  }

  // Customers cannot cancel after dispatch / shipped
  if (isCustomerOwner && (order.status === 'shipped' || order.status === 'delivered' || order.status === 'picked_up')) {
    return res.status(400).json({
      success: false,
      message: `This order is already ${order.status}. Orders cannot be cancelled after dispatch. Please submit a Return Request upon delivery.`,
    });
  }

  if (order.status === 'delivered' || order.status === 'picked_up') {
    return res.status(400).json({
      success: false,
      message: 'Delivered or completed pickup orders cannot be cancelled. Submit a Return Request instead.',
    });
  }

  if (order.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Order is already cancelled' });
  }

  const { reason } = req.body;
  if (!reason && isSellerOwner) {
    return res.status(400).json({ success: false, message: 'A cancellation reason is required from the seller' });
  }

  const cancellationReason = reason || (isCustomerOwner ? 'Customer requested cancellation before dispatch' : 'Store unable to fulfill order');
  const actorName = `${req.user!.name} (${req.user!.role})`;

  const cancelled = dbStore.cancelOrder(order.id, cancellationReason, actorName);

  // Notify counterparty
  if (isCustomerOwner) {
    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      recipientRole: 'seller',
      recipientId: order.vendorId,
      title: `Order #${order.id} Cancelled by Customer`,
      kannadaTitle: `ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ`,
      message: `Customer ${req.user!.name} cancelled Order #${order.id}. Reason: "${cancellationReason}". Reserved inventory restored.`,
      type: 'order',
      linkId: order.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    dbStore.createNotification({
      id: `notif-${Date.now()}`,
      recipientRole: 'customer',
      recipientId: order.customerId,
      title: `Order #${order.id} Cancelled`,
      kannadaTitle: `ಆರ್ಡರ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ`,
      message: `Your order was cancelled by ${order.vendorName}. Reason: "${cancellationReason}". ${order.paymentStatus === 'refunded' ? `Full refund of ₹${order.totalAmount} has been processed.` : ''}`,
      type: 'order',
      linkId: order.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Create Audit Log
  dbStore.createAuditLog({
    actorId: req.user!.id,
    actorName: req.user!.name,
    actorRole: req.user!.role,
    action: 'CANCEL_ORDER',
    targetType: 'order',
    targetId: order.id,
    details: `Order cancelled by ${actorName}. Reason: ${cancellationReason}. Payment status: ${order.paymentStatus}`,
  });

  return res.json({
    success: true,
    order: cancelled,
    message: 'Order cancelled successfully. Inventory restored and refund initiated if prepaid.',
  });
});

// Phase 3: Update Delivery Rider Real-Time GPS Coordinates
ordersRouter.patch('/:id/gps', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { latitude, longitude, addressLabel } = req.body;

  const order = dbStore.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const riderCoordinates = {
    latitude: Number(latitude) || 13.0031,
    longitude: Number(longitude) || 77.5643,
    addressLabel: addressLabel || 'Passing 8th Cross Sampige Rd, Malleshwaram',
    updatedAt: new Date().toISOString(),
  };

  const updated = dbStore.updateOrder(id, {
    riderCoordinates,
    riderId: req.user?.id || 'u-rider-1',
    riderName: req.user?.name || 'Basavaraju M (Santhe EV Rider)',
  });

  return res.json({
    success: true,
    message: 'GPS coordinates broadcast successfully',
    coordinates: riderCoordinates,
    order: updated,
  });
});

// Phase 3: Verify Delivery Handover via QR Code Scan or OTP
ordersRouter.post('/:id/verify-handover', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { qrToken, deliveryOtp } = req.body;

  const order = dbStore.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Allow simulated QR scan or OTP verification
  const isOtpValid = !deliveryOtp || deliveryOtp === (order.deliveryOtp || '4821');
  const isQrValid = !qrToken || qrToken.includes(order.id) || qrToken === order.qrCodeToken;

  if (!isOtpValid && !isQrValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid handover QR Code or Delivery OTP. Please request customer for correct code.',
    });
  }

  const updatedSteps = (order.trackingSteps || []).map((step) => {
    if (step.step === 'Delivered') {
      return { ...step, completed: true, current: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
    return { ...step, current: false };
  });

  const updated = dbStore.updateOrder(id, {
    status: 'delivered',
    trackingSteps: updatedSteps,
    cashCollected: order.paymentMethod.toUpperCase().includes('COD') ? true : order.cashCollected,
    paymentStatus: 'paid',
  });

  // Record audit log
  dbStore.createAuditLog({
    actorId: req.user?.id || 'u-rider-1',
    actorName: req.user?.name || 'Basavaraju M (Santhe EV Rider)',
    actorRole: (req.user?.role as any) || 'rider',
    action: 'DELIVERY_HANDOVER_VERIFIED',
    targetType: 'order',
    targetId: id,
    details: `Delivery handover completed via QR/OTP verification. Order marked delivered.`,
  });

  return res.json({
    success: true,
    message: 'Delivery handover verified successfully! Order completed.',
    order: updated,
  });
});

// Phase 3: Record COD Cash Collection
ordersRouter.post('/:id/collect-cash', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { amountCollected, notes } = req.body;

  const order = dbStore.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const collectedAmt = Number(amountCollected) || order.totalAmount;

  const updated = dbStore.updateOrder(id, {
    cashCollected: true,
    cashCollectedAt: new Date().toISOString(),
    paymentStatus: 'paid',
  });

  dbStore.createAuditLog({
    actorId: req.user?.id || 'u-rider-1',
    actorName: req.user?.name || 'Basavaraju M (Santhe EV Rider)',
    actorRole: (req.user?.role as any) || 'rider',
    action: 'COLLECT_COD_CASH',
    targetType: 'order',
    targetId: id,
    details: `Collected ₹${collectedAmt} in cash at doorstep. Notes: ${notes || 'Payment verified'}.`,
  });

  return res.json({
    success: true,
    message: `₹${collectedAmt} cash collection recorded successfully!`,
    order: updated,
  });
});

// Phase 3: Digital Tax Invoice & Supply Receipt Details
ordersRouter.get('/:id/invoice', (req, res: Response) => {
  const { id } = req.params;
  const order = dbStore.getOrderById(id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const shop = dbStore.getShopById(order.vendorId);

  // Compute itemized tax breakdown
  const itemsBreakdown = (order.items || []).map((it: any, idx: number) => {
    const name = it.name || it.product?.name || `Produce Item ${idx + 1}`;
    const qty = it.quantity || 1;
    const unitPrice = it.priceSnapshot || it.product?.price || 0;
    const total = qty * unitPrice;
    // Fresh vegetables and organic fruits in India are 0% GST (HSN 0702, 0709, 0803)
    const hsn = name.toLowerCase().includes('tomato')
      ? '0702.00.00'
      : name.toLowerCase().includes('banana')
      ? '0803.90.10'
      : name.toLowerCase().includes('palak') || name.toLowerCase().includes('greens')
      ? '0709.70.00'
      : '1905.90.20';
    const gstRate = 0; // Fresh agricultural farm produce
    return {
      slNo: idx + 1,
      name,
      hsn,
      qty,
      unit: it.unit || it.product?.unit || 'kg',
      unitPrice,
      taxableValue: total,
      cgstRate: gstRate / 2,
      cgstAmount: 0,
      sgstRate: gstRate / 2,
      sgstAmount: 0,
      totalAmount: total,
    };
  });

  const invoice = {
    invoiceNumber: order.invoiceNumber || `NS-INV-2026-${order.id.replace(/[^0-9]/g, '').slice(-5) || '10482'}`,
    invoiceDate: order.createdAt,
    orderId: order.id,
    parentOrderId: order.parentOrderId,
    platformGstin: '29AAACN8842K1ZB',
    platformName: 'Namma Santhe Hyperlocal Technologies Pvt. Ltd.',
    platformAddress: '#12, Karnataka State Co-operative Hub, Sampige Road, Malleshwaram, Bengaluru 560003',
    seller: {
      id: order.vendorId,
      name: order.vendorName,
      location: shop?.location || 'Devanahalli, Bengaluru Rural',
      fssaiLicenseNumber: shop?.id === 'v1' ? '11223334000891' : '11222998000543',
      gstin: shop?.id === 'v1' ? '29AAGCR4829L1Z8' : '29AABCL9901M1Z2',
      pan: 'AAGCR4829L',
    },
    customer: {
      name: order.customerName || 'Priya Sharma',
      phone: order.customerPhone || '+91 98450 99887',
      billingAddress: order.deliveryAddress,
      deliveryAddress: order.deliveryAddress,
      pincode: order.deliveryPincode || '560003',
      locality: order.deliveryLocality || 'Malleshwaram',
      state: 'Karnataka (Code 29)',
    },
    payment: {
      method: order.paymentMethod,
      status: order.paymentStatus,
      transactionId: order.paymentTransactionId || 'TXN-RAZORPAY-SECURE',
      gatewayOrderId: order.paymentGatewayOrderId,
      paidAt: order.createdAt,
    },
    items: itemsBreakdown,
    summary: {
      itemsSubtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      ecoPackagingFee: order.ecoPackagingFee,
      discount: order.discount,
      cgstTotal: 0,
      sgstTotal: 0,
      grandTotal: order.totalAmount,
    },
  };

  return res.json({ success: true, invoice });
});
