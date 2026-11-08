/**
 * Local persistent Wishlist utility for BorrowBuy
 */

const STORAGE_KEY = 'borrowbuy_wishlist_ids';

export function getWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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
