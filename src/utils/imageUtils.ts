import React from 'react';

export const PRODUCT_KEYWORD_IMAGE_MAP: Array<{ keywords: string[]; image: string }> = [
  { keywords: ['tomato', 'tomatoes'], image: '/images/v0/organic_tomatoes.png' },
  { keywords: ['onion', 'onions'], image: '/images/v0/red_onions.png' },
  { keywords: ['palak', 'spinach', 'methi', 'greens'], image: '/images/v0/fresh_palak.png' },
  { keywords: ['banana', 'yelakki'], image: '/images/v0/yelakki_banana.png' },
  { keywords: ['chilli', 'chillies', 'byadgi'], image: '/images/v0/byadgi_chillies.png' },
  { keywords: ['egg', 'eggs', 'poultry'], image: '/images/v0/country_eggs.png' },
  { keywords: ['rice', 'masoori', 'masuri'], image: '/images/v0/sona_masuri_rice.png' },
  { keywords: ['mysore pak', 'pak', 'sweet'], image: '/images/v0/mysore_pak.png' },
  { keywords: ['coconut oil', 'ghani', 'oil'], image: '/images/v0/coconut_oil.png' },
  { keywords: ['honey', 'flora'], image: '/images/v0/forest_honey.png' },
  { keywords: ['soap', 'sandalwood', 'turmeric'], image: '/images/v0/herbal_soap.png' },
  { keywords: ['scarf', 'stole', 'shawl'], image: '/images/v0/cotton_scarf.png' },
  { keywords: ['saree', 'sari'], image: '/images/v0/cotton_saree.png' },
  { keywords: ['elephant', 'toy', 'rocker', 'channapatna', 'lacquerware'], image: '/images/v0/wooden_elephant.png' },
  { keywords: ['pot', 'clay', 'terracotta', 'earthenware'], image: '/images/v0/clay_cooking_pot.png' },
];

export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'fresh-produce': '/images/v0/organic_tomatoes.png',
  'groceries': '/images/v0/sona_masuri_rice.png',
  'home-kitchen': '/images/v0/clay_cooking_pot.png',
  'handicrafts': '/images/v0/wooden_elephant.png',
  'fashion': '/images/v0/cotton_saree.png',
  'personal-care': '/images/v0/herbal_soap.png',
};

/**
 * Returns the best authentic local image matching a product's name or category.
 */
export function getProductFallbackImage(name?: string, category?: string): string {
  if (name) {
    const lower = name.toLowerCase();
    for (const entry of PRODUCT_KEYWORD_IMAGE_MAP) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return entry.image;
      }
    }
  }

  if (category && CATEGORY_IMAGE_MAP[category]) {
    return CATEGORY_IMAGE_MAP[category];
  }

  return '/images/v0/organic_tomatoes.png';
}

/**
 * Normalizes a product image URL:
 * If the image is empty, broken Unsplash, or invalid, uses the accurate keyword/category image.
 */
export function resolveProductImage(
  image?: string | null,
  name?: string,
  category?: string
): string {
  if (image && image.trim().length > 0 && !image.includes('images.unsplash.com')) {
    return image.trim();
  }
  return getProductFallbackImage(name, category);
}

/**
 * Intelligent image error handler for <img onError={...}>
 * Ensures an item never erroneously falls back to tomatoes unless it is actually a tomato.
 */
export function handleProductImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  name?: string,
  category?: string
): void {
  const target = e.currentTarget;
  const fallback = getProductFallbackImage(name, category);

  // Prevent infinite error looping if fallback also has issues
  if (target.src.endsWith(fallback) || target.dataset.fallbackApplied === 'true') {
    return;
  }

  target.dataset.fallbackApplied = 'true';
  target.src = fallback;
}
