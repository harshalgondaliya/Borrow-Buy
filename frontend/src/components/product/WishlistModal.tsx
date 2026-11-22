import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../services/products';
import { getWishlistIds, removeFromWishlist } from '../../utils/wishlist';
import { formatINR } from '../../utils/formatters';
import { X, Heart, Trash2, ArrowRight, MapPin, PackageOpen } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onInitiateBooking: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onInitiateBooking,
}) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setWishlistIds(getWishlistIds());
    }
    const handleUpdate = () => {
      setWishlistIds(getWishlistIds());
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-bb-border max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-bb-text-secondary hover:text-bb-text-primary p-2 rounded-xl hover:bg-bb-surface-subtle transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-bb-border">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-bb-text-primary">
                Your Saved Wishlist
              </h2>
              <p className="text-xs text-bb-text-secondary">
                {savedProducts.length} {savedProducts.length === 1 ? 'item' : 'items'} saved for upcoming rentals
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            {savedProducts.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-16 h-16 bg-bb-surface-subtle text-bb-text-secondary rounded-2xl flex items-center justify-center mx-auto mb-3 border border-bb-border">
                  <PackageOpen className="w-8 h-8 text-bb-text-secondary" />
                </div>
                <h4 className="text-sm font-bold text-bb-text-primary font-display">Your wishlist is empty</h4>
                <p className="text-xs text-bb-text-secondary mt-1 max-w-sm mx-auto leading-relaxed">
                  Click the heart icon on any camera, laptop, or tool in the catalog to save it for quick rental planning.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-bb-accent hover:bg-bb-accent-hover text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {savedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl border border-bb-border bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card"
                  >
                    <div
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                      className="flex items-center gap-3.5 cursor-pointer min-w-0 flex-1 group"
                    >
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=120&q=80'}
                        alt={product.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-bb-border shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-bb-accent uppercase tracking-wider">
                          {product.category?.name}
                        </div>
                        <h4 className="text-sm font-extrabold text-bb-text-primary group-hover:text-bb-accent transition-colors truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-bb-text-secondary mt-0.5">
                          <span className="font-display font-extrabold text-bb-text-primary">
                            {formatINR(product.pricePerDay)}/day
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-bb-text-secondary">
                            <MapPin className="w-3 h-3 text-bb-text-secondary" />
                            <span className="truncate max-w-[140px]">{product.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        title="Remove from saved"
                        className="p-2 text-bb-text-secondary hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onInitiateBooking(product);
                        }}
                        className="px-4 py-2 bg-bb-accent hover:bg-bb-accent-hover text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <span>Rent Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
