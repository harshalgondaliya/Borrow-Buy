/**
 * Centralized API & Asset URL Resolver for BorrowBuy
 * Automatically detects whether running locally or on AWS CloudFront / EC2
 */

// Host URL (e.g., "http://localhost:5000", "http://13.232.x.x:5000", or "https://api.borrowbuy.in")
export const API_HOST = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000'
).replace(/\/+$/, '');

// Full API endpoint base (e.g., "http://localhost:5000/api", "https://api.borrowbuy.in/api")
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  `${API_HOST}/api`
).replace(/\/+$/, '');

/**
 * Resolves an image URL safely:
 * - External URLs (http/https): returns unchanged
 * - Local static assets (/images/products/...): returns unchanged for Vite public serving
 * - Backend uploads (/uploads/...): prepends API_HOST
 * - Missing/empty: returns high-quality fallback photo
 */
export function resolveImageUrl(url?: string): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/images/')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_HOST}${cleanPath}`;
}
