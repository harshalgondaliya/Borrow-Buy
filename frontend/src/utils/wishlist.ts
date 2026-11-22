/**
 * Local persistent Wishlist utility for BorrowBuy
 */

const STORAGE_KEY = 'borrowbuy_wishlist_ids';

// Default premier gear IDs to show when storage is fresh/uninitialized
const DEFAULT_WISHLIST_IDS = [
  '00000001-0000-4000-8000-000000000001', // Sony Alpha a7 IV
  '00000001-0000-4000-8000-000000000004', // GoPro HERO 12 Black
];

export function getWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    // Initialize default wishlist items so user does not see an empty state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WISHLIST_IDS));
    } catch {
      // ignore
    }
    return DEFAULT_WISHLIST_IDS;
  } catch {
    return DEFAULT_WISHLIST_IDS;
  }
}

export function isInWishlist(productId: string): boolean {
  const ids = getWishlistIds();
  return ids.includes(productId);
}

export function toggleWishlist(productId: string): boolean {
  const ids = getWishlistIds();
  const index = ids.indexOf(productId);
  let nowLiked = false;

  if (index >= 0) {
    ids.splice(index, 1);
    nowLiked = false;
  } else {
    ids.push(productId);
    nowLiked = true;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }

  // Dispatch custom event for real-time sync across components
  window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { ids } }));

  return nowLiked;
}

export function removeFromWishlist(productId: string): void {
  const ids = getWishlistIds().filter((id) => id !== productId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { ids } }));
}
