import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const notificationsRouter = Router();

// Get notifications for current user/role
notificationsRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const allNotifs = dbStore.getNotifications();

  let userNotifs = allNotifs.filter((n) => {
    if (req.user?.role === 'admin') {
      return n.recipientRole === 'admin' || n.recipientId === req.user.id;
    }
    if (req.user?.role === 'seller') {
      return (
        (n.recipientRole === 'seller' && (n.recipientId === req.user.shopId || n.recipientId === req.user.id)) ||
        n.recipientId === req.user.id
      );
    }
    return n.recipientRole === 'customer' && n.recipientId === req.user?.id;
  });

  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  return res.json({ success: true, count: userNotifs.length, unreadCount, notifications: userNotifs });
});

// Mark single notification as read
notificationsRouter.put('/:id/read', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const success = dbStore.markNotificationAsRead(req.params.id);
  return res.json({ success });
});

// In-memory store for simulated WhatsApp & SMS webhook logs
let webhookLogs: any[] = [
  {
    id: 'wh-seed-1',
    orderId: 'NS-8841',
    recipientPhone: '+91 98450 99887',
    recipientName: 'Priya Sharma',
    channel: 'whatsapp',
    templateName: 'order_confirmed_v1',
    message: '🌿 *Namaskara Priya!* Your Namma Santhe order #NS-8841 (₹162) is confirmed with Ravi Organic Farms. Payment verified via Razorpay. Track live harvest: https://nammasanthe.com/track/NS-8841',
    trackingLink: 'https://nammasanthe.com/track/NS-8841',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'wh-seed-2',
    orderId: 'NS-8841',
    recipientPhone: '+91 98450 99887',
    recipientName: 'Priya Sharma',
    channel: 'sms',
    templateName: 'dlt_order_dispatch',
    message: 'VK-SANTHE: Priya, rider Basavaraju (EV #R-402) is out for delivery with your fresh farm basket. OTP: 4821. Live GPS: 13.0031, 77.5643. - Namma Santhe',
    trackingLink: 'https://nammasanthe.com/track/NS-8841',
    status: 'delivered',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
];

// Phase 3: Simulated Automated WhatsApp & SMS Notification Webhook
notificationsRouter.post('/webhook/simulate', (req, res: Response) => {
  const {
    orderId = 'NS-LIVE',
    event = 'order_confirmed',
    recipientPhone = '+91 98450 99887',
    recipientName = 'Priya Sharma',
    channel = 'both',
    amount = 162,
    vendorName = 'Ravi Organic Farms',
    riderName = 'Basavaraju M (Santhe EV Rider)',
    otp = '4821',
  } = req.body;

  const trackingLink = `http://localhost:5000/track/${orderId}`;
  const now = new Date().toISOString();
  const createdLogs: any[] = [];

  // Generate WhatsApp Payload
  if (channel === 'whatsapp' || channel === 'both') {
    let waText = '';
    if (event === 'order_confirmed' || event === 'payment_confirmed') {
      waText = `🌿 *Namaskara ${recipientName}!* Your Namma Santhe order *#${orderId}* of *₹${amount}* has been confirmed by *${vendorName}*. Direct farm harvest initiated with zero middleman markup. 💳 Payment received via Razorpay Gateway. Track order live: ${trackingLink}`;
    } else if (event === 'packed') {
      waText = `📦 *Produce Packed!* Fresh vegetables and greens for order *#${orderId}* have been weighed, quality-inspected, and packed in eco-friendly banana-fiber bags by *${vendorName}*. Ready for courier dispatch!`;
    } else if (event === 'out_for_delivery') {
      waText = `🛵 *Out for Delivery!* Santhe Rider *${riderName}* has picked up your produce and is en route via electric scooter. Real-time GPS coordinates active. 🔑 Share delivery OTP: *${otp}* upon arrival. Track live: ${trackingLink}`;
    } else if (event === 'delivered') {
      waText = `🎉 *Delivered Fresh!* Your organic harvest order *#${orderId}* has been delivered to your doorstep at Malleshwaram. Enjoy clean chemical-free produce! Please share produce photos & rate local farmers on Namma Santhe.`;
    } else {
      waText = `🌿 *Namma Santhe Alert:* Order #${orderId} status updated to ${event.toUpperCase()}. Track here: ${trackingLink}`;
    }

    const waLog = {
      id: `wh-wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId,
      recipientPhone,
      recipientName,
      channel: 'whatsapp',
      templateName: `santhe_${event}_v2`,
      message: waText,
      trackingLink,
      status: 'delivered',
      timestamp: now,
    };
    webhookLogs.unshift(waLog);
    createdLogs.push(waLog);
  }

  // Generate SMS Payload (DLT Registered Format)
  if (channel === 'sms' || channel === 'both') {
    let smsText = '';
    if (event === 'order_confirmed' || event === 'payment_confirmed') {
      smsText = `VK-SANTHE: Order #${orderId} of Rs.${amount} confirmed with ${vendorName}. Payment verified. Live tracking: ${trackingLink} - Namma Santhe`;
    } else if (event === 'out_for_delivery') {
      smsText = `VK-SANTHE: Rider ${riderName} is out for delivery for #${orderId}. Share delivery OTP ${otp} at doorstep. Live GPS active. - Namma Santhe`;
    } else if (event === 'delivered') {
      smsText = `VK-SANTHE: Order #${orderId} delivered at Malleshwaram. Thank you for supporting Karnataka local farmers. - Namma Santhe`;
    } else {
      smsText = `VK-SANTHE: Order #${orderId} updated to ${event}. Info: ${trackingLink} - Namma Santhe`;
    }

    const smsLog = {
      id: `wh-sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId,
      recipientPhone,
      recipientName,
      channel: 'sms',
      templateName: `dlt_santhe_${event}`,
      message: smsText,
      trackingLink,
      status: 'delivered',
      timestamp: now,
    };
    webhookLogs.unshift(smsLog);
    createdLogs.push(smsLog);
  }

  return res.status(201).json({
    success: true,
    message: `Automated WhatsApp & SMS notifications dispatched to ${recipientPhone}`,
    dispatchedCount: createdLogs.length,
    notifications: createdLogs,
  });
});

// Phase 3: Retrieve Webhook Notification History
notificationsRouter.get('/webhook/logs', (_req, res: Response) => {
  return res.json({
    success: true,
    count: webhookLogs.length,
    logs: webhookLogs,
  });
});
