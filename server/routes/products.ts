import { Router, Response } from 'express';
import { dbStore } from '../dbStore';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { Product } from '../types';

export const productsRouter = Router();

// Get categories
productsRouter.get('/categories', (_req, res: Response) => {
  const categories = dbStore.getCategories();
  const products = dbStore.getProducts();

  const enriched = categories.map((cat) => {
    const count = products.filter((p) => p.category === cat.id && !p.isSuspicious).length;
    return {
      ...cat,
      itemCount: count,
    };
  });

  return res.json({ success: true, categories: enriched });
});

// List products with full search, sorting and filters
productsRouter.get('/', (req, res: Response) => {
  const {
    search,
    category,
    subCategory,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    vendorId,
    organicOnly,
    sort,
    locality,
    includeSuspicious,
  } = req.query;

  let products = dbStore.getProducts();

  // Filter out suspicious products unless admin specifically requests
  if (includeSuspicious !== 'true') {
    products = products.filter((p) => !p.isSuspicious);
  }

  if (vendorId && typeof vendorId === 'string') {
    products = products.filter((p) => p.vendorId === vendorId);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }

  if (subCategory && typeof subCategory === 'string') {
    products = products.filter((p) => p.subCategory?.toLowerCase() === subCategory.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.kannadaName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    products = products.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }

  if (minRating) {
    products = products.filter((p) => p.rating >= Number(minRating));
  }

  if (inStockOnly === 'true') {
    products = products.filter((p) => p.inStock && p.stockCount > 0);
  }

  if (organicOnly === 'true') {
    products = products.filter((p) => p.isOrganic);
  }

  // Hyperlocal shop distance enrichment
  const shops = dbStore.getShops();
  const shopMap = new Map(shops.map((s) => [s.id, s]));

  const enriched = products.map((p) => {
    const shop = shopMap.get(p.vendorId);
    let distance = shop ? shop.distanceKm : 2.5;
    if (locality && typeof locality === 'string' && shop) {
      const isExact = shop.locality.toLowerCase() === locality.toLowerCase();
      distance = isExact ? 0.8 : shop.distanceKm;
    }
    return {
      ...p,
      distanceKm: distance,
      vendorVerified: shop?.verificationStatus === 'verified',
    };
  });

  // Sorting
  if (sort === 'price_asc') {
    enriched.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    enriched.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    enriched.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'distance') {
    enriched.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sort === 'newest') {
    enriched.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return res.json({ success: true, count: enriched.length, products: enriched });
});

// Personalized recommendations
productsRouter.get('/recommendations', (req, res: Response) => {
  const { customerId, preferredCategory } = req.query;
  const products = dbStore.getProducts().filter((p) => !p.isSuspicious);

  let recommendations: Product[] = [];

  if (customerId && typeof customerId === 'string') {
    const customerOrders = dbStore
      .getOrders()
      .filter((o) => o.customerId === customerId);

    // Extract categories user has purchased
    const purchasedCategories = new Set<string>();
    customerOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = dbStore.getProductById(item.productId);
        if (prod) purchasedCategories.add(prod.category);
      });
    });

    if (purchasedCategories.size > 0) {
      recommendations = products.filter((p) => purchasedCategories.has(p.category));
    }
  }

  if (preferredCategory && typeof preferredCategory === 'string' && recommendations.length < 4) {
    const catProds = products.filter((p) => p.category === preferredCategory);
    recommendations = Array.from(new Set([...recommendations, ...catProds]));
  }

  // Fallback: popular / top-rated deals
  if (recommendations.length < 4) {
    const topRated = [...products].sort((a, b) => b.rating - a.rating);
    recommendations = Array.from(new Set([...recommendations, ...topRated])).slice(0, 8);
  }

  return res.json({ success: true, recommendations: recommendations.slice(0, 8) });
});

// Smart Product Comparison (2-4 products)
productsRouter.post('/compare', (req, res: Response) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
    return res.status(400).json({
      success: false,
      message: 'Please select between 2 and 4 products to compare',
    });
  }

  const products: any[] = [];
  const shops = dbStore.getShops();
  const shopMap = new Map(shops.map((s) => [s.id, s]));

  for (const id of productIds) {
    const prod = dbStore.getProductById(id);
    if (prod) {
      const shop = shopMap.get(prod.vendorId);
      products.push({
        ...prod,
        shopRating: shop?.rating || 4.5,
        shopVerified: shop?.verificationStatus === 'verified',
        distanceKm: shop?.distanceKm || 2.0,
        estimatedDeliveryTime: `${Math.round((shop?.distanceKm || 2) * 12 + 20)} mins`,
        returnPolicyDays: prod.returnWindowDays || shop?.returnPolicyWindowDays || 7,
        returnPolicyDetails: shop?.returnPolicyDetails || 'Standard return policy',
      });
    }
  }

  if (products.length < 2) {
    return res.status(404).json({ success: false, message: 'Products not found for comparison' });
  }

  // Find lowest price
  let minPrice = Infinity;
  let bestPriceId = '';
  products.forEach((p) => {
    if (p.price < minPrice) {
      minPrice = p.price;
      bestPriceId = p.id;
    }
  });

  // Find highest rated
  let highestRating = -1;
  let bestRatedId = '';
  products.forEach((p) => {
    if (p.rating > highestRating) {
      highestRating = p.rating;
      bestRatedId = p.id;
    }
  });

  return res.json({
    success: true,
    comparedProducts: products,
    bestPriceProductId: bestPriceId,
    bestRatedProductId: bestRatedId,
  });
});

// Product details
productsRouter.get('/:id', (req, res: Response) => {
  const product = dbStore.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const shop = dbStore.getShopById(product.vendorId);
  const reviews = dbStore.getReviews().filter((r) => r.productId === product.id);

  // Similar products from same category or vendor
  const similarProducts = dbStore
    .getProducts()
    .filter((p) => p.id !== product.id && p.category === product.category && !p.isSuspicious)
    .slice(0, 4);

  return res.json({
    success: true,
    product: {
      ...product,
      distanceKm: shop?.distanceKm || 2.0,
      vendorVerified: shop?.verificationStatus === 'verified',
    },
    shop,
    reviews,
    similarProducts,
  });
});

// Create product (Seller only)
productsRouter.post('/', authenticate, requireRole('seller'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.shopId) {
    return res.status(400).json({ success: false, message: 'Seller must have a shop profile' });
  }

  const shop = dbStore.getShopById(req.user.shopId);
  if (!shop) {
    return res.status(404).json({ success: false, message: 'Shop profile not found' });
  }

  const {
    name,
    kannadaName,
    category,
    subCategory,
    price,
    originalPrice,
    unit,
    image,
    stockCount,
    isOrganic,
    isLocallySourced,
    noChemicals,
    tags,
    description,
    harvestDate,
    nutritionalBenefits,
    specifications,
    returnWindowDays,
  } = req.body;

  if (!name || !price || !unit || !category) {
    return res.status(400).json({ success: false, message: 'Name, price, unit and category are required' });
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    vendorId: shop.id,
    vendorName: shop.name,
    vendorLocation: shop.location,
    name,
    kannadaName: kannadaName || name,
    category,
    subCategory: subCategory || 'General',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price),
    unit,
    image:
      image ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 0,
    inStock: Number(stockCount || 10) > 0,
    stockCount: Number(stockCount || 10),
    reservedCount: 0,
    isOrganic: Boolean(isOrganic),
    isLocallySourced: isLocallySourced !== undefined ? Boolean(isLocallySourced) : true,
    noChemicals: Boolean(noChemicals),
    tags: Array.isArray(tags) ? tags : ['Fresh', 'Local'],
    description: description || 'Fresh high-quality product from local artisan/vendor.',
    harvestDate: harvestDate || 'Daily Fresh',
    nutritionalBenefits: Array.isArray(nutritionalBenefits) ? nutritionalBenefits : ['Locally harvested'],
    specifications: Array.isArray(specifications) ? specifications : [],
    returnWindowDays: returnWindowDays ? Number(returnWindowDays) : shop.returnPolicyWindowDays || 7,
    createdAt: new Date().toISOString(),
  };

  dbStore.createProduct(newProduct);

  return res.status(201).json({ success: true, product: newProduct });
});

// Update product (Seller for own product, or Admin)
productsRouter.put('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const prod = dbStore.getProductById(req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

  if (req.user?.role !== 'admin' && req.user?.shopId !== prod.vendorId) {
    return res.status(403).json({ success: false, message: 'Unauthorized to edit this product' });
  }

  const {
    name,
    kannadaName,
    price,
    originalPrice,
    unit,
    image,
    stockCount,
    description,
    isOrganic,
    tags,
    returnWindowDays,
    isSuspicious,
  } = req.body;

  const updates: Partial<Product> = {};
  if (name !== undefined) updates.name = name;
  if (kannadaName !== undefined) updates.kannadaName = kannadaName;
  if (price !== undefined) updates.price = Number(price);
  if (originalPrice !== undefined) updates.originalPrice = Number(originalPrice);
  if (unit !== undefined) updates.unit = unit;
  if (image !== undefined) updates.image = image;
  if (stockCount !== undefined) {
    updates.stockCount = Number(stockCount);
    updates.inStock = Number(stockCount) > 0;
  }
  if (description !== undefined) updates.description = description;
  if (isOrganic !== undefined) updates.isOrganic = Boolean(isOrganic);
  if (tags !== undefined) updates.tags = tags;
  if (returnWindowDays !== undefined) updates.returnWindowDays = Number(returnWindowDays);
  if (isSuspicious !== undefined && req.user?.role === 'admin') {
    updates.isSuspicious = Boolean(isSuspicious);
  }

  const updated = dbStore.updateProduct(prod.id, updates);

  return res.json({ success: true, product: updated });
});

// Delete product
productsRouter.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const prod = dbStore.getProductById(req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

  if (req.user?.role !== 'admin' && req.user?.shopId !== prod.vendorId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  dbStore.deleteProduct(prod.id);
  return res.json({ success: true, message: 'Product removed successfully' });
});
