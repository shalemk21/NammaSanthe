import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../dbStore';
import { signToken, authenticate, AuthenticatedRequest } from '../middleware/auth';
import { User, Shop, UserRole } from '../types';

export const authRouter = Router();

// Register
authRouter.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, role, phone, locality, city, pincode, shopName, shopType, speciality } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required registration fields' });
    }

    const existingUser = dbStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `u-${Date.now()}`;

    let shopId: string | undefined = undefined;

    // If seller, initialize their shop
    if (role === 'seller') {
      shopId = `shop-${Date.now()}`;
      const newShop: Shop = {
        id: shopId,
        name: shopName || `${name}'s Store`,
        kannadaName: shopName || name,
        ownerId: userId,
        type: shopType || 'Local Grocery & Fresh Produce',
        location: locality ? `${locality}, ${city || 'Bengaluru'}` : 'Bengaluru',
        city: city || 'Bengaluru',
        locality: locality || 'Malleshwaram',
        pincode: pincode || '560003',
        distanceKm: 2.5,
        rating: 5.0,
        reviewsCount: 0,
        verificationStatus: 'pending',
        verificationNotes: 'New shop registration pending admin review.',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
        speciality: speciality || 'Fresh Local Goods',
        openStatus: true,
        phone: phone || '+91 98000 00000',
        operatingHours: '8:00 AM - 9:00 PM',
        serviceableLocalities: [locality || 'Malleshwaram', 'Central Bengaluru'],
        serviceableRadiusKm: 10,
        returnPolicyWindowDays: 7,
        returnPolicyDetails: 'Standard 7-day return policy for unopened items.',
        createdAt: new Date().toISOString(),
      };
      dbStore.createShop(newShop);

      // Notify admin
      dbStore.createNotification({
        id: `notif-${Date.now()}`,
        recipientRole: 'admin',
        recipientId: 'u-admin-1',
        title: 'New Seller Registration',
        kannadaTitle: 'ಹೊಸ ಮಾರಾಟಗಾರರ ನೋಂದಣಿ',
        message: `${newShop.name} (${name}) registered as a seller and requires verification.`,
        type: 'system',
        linkId: shopId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    const newUser: User = {
      id: userId,
      name,
      email,
      passwordHash,
      role: role as UserRole,
      phone,
      locality,
      city: city || 'Bengaluru',
      pincode: pincode || '560003',
      address: locality ? `${locality}, ${city || 'Bengaluru'}` : 'Bengaluru',
      shopId,
      createdAt: new Date().toISOString(),
    };

    dbStore.createUser(newUser);

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      shopId: newUser.shopId,
    });

    const userShop = shopId ? dbStore.getShopById(shopId) : undefined;

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        locality: newUser.locality,
        city: newUser.city,
        pincode: newUser.pincode,
        shopId: newUser.shopId,
        shop: userShop,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
  }
});

// Login
authRouter.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = dbStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      shopId: user.shopId,
    });

    const userShop = user.shopId ? dbStore.getShopById(user.shopId) : undefined;

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        locality: user.locality,
        city: user.city,
        pincode: user.pincode,
        shopId: user.shopId,
        shop: userShop,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Server error during login' });
  }
});

// Get current user profile
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const user = dbStore.getUserById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const userShop = user.shopId ? dbStore.getShopById(user.shopId) : undefined;

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      locality: user.locality,
      city: user.city,
      pincode: user.pincode,
      shopId: user.shopId,
      shop: userShop,
    },
  });
});

// Update Profile
authRouter.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });
  const { name, phone, address, locality, city, pincode } = req.body;

  const updated = dbStore.updateUser(req.user.id, {
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
    ...(address ? { address } : {}),
    ...(locality ? { locality } : {}),
    ...(city ? { city } : {}),
    ...(pincode ? { pincode } : {}),
  });

  return res.json({ success: true, user: updated });
});

// Demo accounts list for instant one-click switching and testing
authRouter.get('/seed-users', (_req, res: Response) => {
  const users = dbStore.getUsers().map((u) => {
    const shop = u.shopId ? dbStore.getShopById(u.shopId) : undefined;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      shopId: u.shopId,
      shopName: shop?.name,
      locality: u.locality || 'Malleshwaram',
      demoPassword: u.role === 'admin' ? 'admin123' : 'pass123',
    };
  });
  return res.json({ success: true, users });
});
