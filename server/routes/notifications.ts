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

// Mark all as read
notificationsRouter.put('/read-all', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    dbStore.markAllNotificationsAsRead(req.user.id);
    if (req.user.shopId) {
      dbStore.markAllNotificationsAsRead(req.user.shopId);
    }
  }
  return res.json({ success: true });
});
