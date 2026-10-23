import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { Shop } from '../types';

export const shopsRouter = Router();

// List shops with hyperlocal discovery and filters
shopsRouter.get('/', (req, res: Response) => {
  const { locality, city, pincode, search, all } = req.query;

  let shops = dbStore.getShops();

  // If customer request (not 'all=true'), only show verified shops
  if (all !== 'true') {
    shops = shops.filter((s) => s.verificationStatus === 'verified');
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    shops = shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.kannadaName.toLowerCase().includes(q) ||
        s.speciality.toLowerCase().includes(q) ||
        s.locality.toLowerCase().includes(q)
    );
  }

  if (city && typeof city === 'string') {
    shops = shops.filter((s) => s.city.toLowerCase() === city.toLowerCase());
  }

  if (pincode && typeof pincode === 'string') {
    const pin = pincode.trim();
    // Prioritize shops that service this PIN code
    shops = shops.filter((s) => s.serviceablePincodes?.includes(pin) || s.pincode === pin);
  }

  if (locality && typeof locality === 'string') {
    const locLower = locality.toLowerCase();
    // Prioritize shops located in this locality or serviceable in this locality
    shops = shops.map((s) => {
      const isExact = s.locality.toLowerCase() === locLower;
      const isServiceable = s.serviceableLocalities.some((l) =>
        l.toLowerCase().includes(locLower)
      );
      // Realistic distance offset based on match
      const adjustedDistance = isExact ? 0.8 : isServiceable ? s.distanceKm : s.distanceKm + 3.5;
      return {
        ...s,
        distanceKm: parseFloat(adjustedDistance.toFixed(1)),
        isDirectLocality: isExact,
      };
    });
  }

  // Sort by distance if locality provided, otherwise rating
  shops.sort((a, b) => a.distanceKm - b.distanceKm);

  return res.json({ success: true, count: shops.length, shops });
});

// Get shop details with products and reviews
shopsRouter.get('/:id', (req, res: Response) => {
  const shop = dbStore.getShopById(req.params.id);
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  const products = dbStore.getProducts().filter((p) => p.vendorId === shop.id && !p.isSuspicious);
  const reviews = dbStore.getReviews().filter((r) => r.vendorId === shop.id && r.status !== 'hidden');

  return res.json({
    success: true,
    shop,
    products,
    reviews,
  });
});

// Update shop profile & delivery settings (Seller only for own shop, or Admin)
shopsRouter.put('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const shopId = req.params.id;
  const shop = dbStore.getShopById(shopId);
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop not found' });
  }

  if (req.user?.role !== 'admin' && req.user?.shopId !== shopId) {
    return res.status(403).json({ success: false, message: 'Unauthorized to edit this shop' });
  }

  const {
    name,
    kannadaName,
    speciality,
    phone,
    operatingHours,
    openStatus,
    serviceableLocalities,
    serviceableRadiusKm,
    serviceablePincodes,
    minOrderValue,
    deliveryCharge,
    freeDeliveryThreshold,
    estimatedPrepTimeMinutes,
    allowPickup,
    allowCod,
    deliveryPartnerType,
    returnPolicyWindowDays,
    returnPolicyDetails,
    avatar,
    coverImage,
  } = req.body;

  const updated = dbStore.updateShop(shopId, {
    ...(name !== undefined ? { name } : {}),
    ...(kannadaName !== undefined ? { kannadaName } : {}),
    ...(speciality !== undefined ? { speciality } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(operatingHours !== undefined ? { operatingHours } : {}),
    ...(openStatus !== undefined ? { openStatus } : {}),
    ...(serviceableLocalities !== undefined ? { serviceableLocalities } : {}),
    ...(serviceableRadiusKm !== undefined ? { serviceableRadiusKm: Number(serviceableRadiusKm) } : {}),
    ...(serviceablePincodes !== undefined ? { serviceablePincodes } : {}),
    ...(minOrderValue !== undefined ? { minOrderValue: Number(minOrderValue) } : {}),
    ...(deliveryCharge !== undefined ? { deliveryCharge: Number(deliveryCharge) } : {}),
    ...(freeDeliveryThreshold !== undefined ? { freeDeliveryThreshold: Number(freeDeliveryThreshold) } : {}),
    ...(estimatedPrepTimeMinutes !== undefined ? { estimatedPrepTimeMinutes: Number(estimatedPrepTimeMinutes) } : {}),
    ...(allowPickup !== undefined ? { allowPickup: Boolean(allowPickup) } : {}),
    ...(allowCod !== undefined ? { allowCod: Boolean(allowCod) } : {}),
    ...(deliveryPartnerType !== undefined ? { deliveryPartnerType } : {}),
    ...(returnPolicyWindowDays !== undefined ? { returnPolicyWindowDays: Number(returnPolicyWindowDays) } : {}),
    ...(returnPolicyDetails !== undefined ? { returnPolicyDetails } : {}),
    ...(avatar !== undefined ? { avatar } : {}),
    ...(coverImage !== undefined ? { coverImage } : {}),
  });

  return res.json({ success: true, shop: updated });
});

// Seller submits verification request
shopsRouter.post('/:id/verify-request', authenticate, requireRole('seller'), (req: AuthenticatedRequest, res: Response) => {
  const shopId = req.params.id;
  const shop = dbStore.getShopById(shopId);
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

  if (req.user?.shopId !== shopId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { notes, documentType, documentNumber } = req.body;

  const verificationNotes = `Documents submitted: ${documentType || 'Trade License / FSSAI'} #${documentNumber || 'SUBMITTED'}. Notes: ${notes || 'Ready for review'}`;

  const updated = dbStore.updateShop(shopId, {
    verificationStatus: 'pending',
    verificationNotes,
  });

  dbStore.createNotification({
    id: `notif-${Date.now()}`,
    recipientRole: 'admin',
    recipientId: 'u-admin-1',
    title: 'Verification Documents Received',
    kannadaTitle: 'ಮಾರಾಟಗಾರರ ಪರಿಶೀಲನೆ ದಾಖಲೆಗಳು',
    message: `${shop.name} submitted documents for verification review.`,
    type: 'system',
    linkId: shopId,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, shop: updated, message: 'Verification request submitted successfully' });
});
