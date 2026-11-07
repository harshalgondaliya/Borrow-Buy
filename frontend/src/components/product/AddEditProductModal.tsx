import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Product, productsService } from '../../services/products';
import {
  X,
  Upload,
  AlertCircle,
  Package,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  productToEdit?: Product | null;
  onSuccess: () => void;
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  productToEdit,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [condition, setCondition] = useState<'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'>('GOOD');
  const [location, setLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategoryId(productToEdit.categoryId);
      setBrand(productToEdit.brand || '');
      setModel(productToEdit.model || '');
      setPricePerDay(productToEdit.pricePerDay.toString());
      setSecurityDeposit(productToEdit.securityDeposit.toString());
      setCondition(productToEdit.condition);
      setLocation(productToEdit.location);
      setSelectedFiles([]);
      setPreviewUrls(productToEdit.images || []);
    } else {
      setName('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setBrand('');
      setModel('');
      setPricePerDay('');
      setSecurityDeposit('');
      setCondition('GOOD');
      setLocation('');
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
    setError(null);
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      if (brand) formData.append('brand', brand);
      if (model) formData.append('model', model);
      formData.append('pricePerDay', pricePerDay);
      formData.append('securityDeposit', securityDeposit);
      formData.append('condition', condition);
      formData.append('location', location);

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (productToEdit) {
        await productsService.updateProduct(productToEdit.id, formData);
      } else {
        await productsService.createProduct(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-elevated border border-charcoal-100 max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-2 rounded-xl hover:bg-charcoal-100/70 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Package className="w-3.5 h-3.5" />
              <span>{productToEdit ? 'Inventory Management' : 'Lender Marketplace'}</span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-charcoal-900 tracking-tight">
              {productToEdit ? 'Edit Equipment Listing' : 'List Equipment for Rent'}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              Provide authentic photographs, accurate condition ratings, and rental deposit requirements.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sony Alpha a7 IV Full-Frame Camera"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all font-medium text-charcoal-800"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                  Equipment Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all font-medium text-charcoal-800"
                >
                  <option value="BRAND_NEW">Brand New (Pristine Box)</option>
                  <option value="LIKE_NEW">Like New (Mint Condition)</option>
                  <option value="GOOD">Good (Light Normal Wear)</option>
                  <option value="FAIR">Fair (Visible Wear / Operational)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                  Brand <span className="text-charcoal-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sony, DJI, Apple"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                  Model <span className="text-charcoal-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. ILCE-7M4"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                  Daily Rental Rate ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  placeholder="45.00"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400 font-display font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                  Refundable Deposit ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  placeholder="200.00"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400 font-display font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                Pickup / Return Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Downtown, Seattle, WA"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                Description & Included Accessories *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what is included (batteries, cables, carry bag, memory card) and any specific care instructions..."
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
              />
            </div>

            {/* Photo Upload Reel */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                Product Photographs (Unsplash or Real Photos)
              </label>
              <div className="border-2 border-dashed border-charcoal-300 rounded-2xl p-4 text-center hover:bg-charcoal-50 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-charcoal-400 group-hover:text-brand-600 mx-auto mb-1.5 transition-colors" />
                <div className="text-xs font-bold text-charcoal-800">
                  Click to select images (Max 5MB each)
                </div>
                <div className="text-[11px] text-charcoal-400 mt-0.5">
                  JPEG, PNG, WEBP supported
                </div>
              </div>

              {previewUrls.length > 0 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                  {previewUrls.map((url, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-charcoal-200 shrink-0 shadow-sm"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-charcoal-500 hover:text-charcoal-800 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs rounded-xl shadow-card transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Listing...</span>
                  </>
                ) : (
                  <>
                    <span>{productToEdit ? 'Save Listing Changes' : 'Publish Equipment Listing'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
