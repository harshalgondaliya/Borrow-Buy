/**
 * Centralized API & Asset URL Resolver for BorrowBuy
 * Automatically detects whether running locally or on AWS CloudFront / EC2
 */

const isProd = import.meta.env.PROD;

// Host URL: In production, relative empty string preserves same-origin over HTTPS
export const API_HOST = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
  (isProd ? '' : 'http://localhost:5000')
).replace(/\/+$/, '');

// Full API endpoint base: In production, relative '/api' avoids mixed-content & hardcoded hostnames
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (isProd ? '/api' : `${API_HOST}/api`)
).replace(/\/+$/, '');

/**
 * Resolves an image URL safely:
 * - External URLs (http/https): returns unchanged
 * - Local static assets (/images/products/...): returns unchanged for public serving
 * - Backend uploads (/uploads/...): returns relative or prepended API_HOST
 * - Missing/empty: returns high-quality fallback photo
 */
export function resolveImageUrl(url?: string): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
  }
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  // Normalize private S3 bucket URLs through the backend /api/media proxy
  const s3Match = url.match(/^https:\/\/[^/]+\.s3(?:\.[^.]+)?\.amazonaws\.com\/(products|user-uploads)\/([^/?#]+)/);
  if (s3Match) {
    return `${API_HOST}/api/media/${s3Match[1]}/${s3Match[2]}`;
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
