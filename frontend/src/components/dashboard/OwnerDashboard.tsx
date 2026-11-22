import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Product, productsService, Category } from '../../services/products';
import { Booking, bookingsService } from '../../services/bookings';
import { qrService } from '../../services/qr';
import { useToast } from '../../features/toast/ToastContext';
import { formatINR, formatDateIN } from '../../utils/formatters';
import {
  Plus,
  Edit2,
  PowerOff,
  Package,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ScanLine,
  TrendingUp,
  Clock,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react';
import { AddEditProductModal } from '../product/AddEditProductModal';

interface OwnerDashboardProps {
  categories: Category[];
  onRefreshProducts: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  categories,
  onRefreshProducts,
}) => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'handover'>('inventory');
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // QR Handover scan states
  const [scanCode, setScanCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);

  const fetchMyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, bookRes] = await Promise.all([
        productsService.getOwnerProducts(),
        bookingsService.getOwnerBookings(),
      ]);
      setMyProducts(prodRes.data);
      setBookingRequests(bookRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load owner dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleDeactivate = async (productId: string) => {
    if (!confirm('Are you sure you want to change this listing status?')) return;
    try {
      await productsService.deleteProduct(productId);
      fetchMyData();
      onRefreshProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to update listing status');
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await bookingsService.confirmBooking(bookingId);
      success('Booking confirmed! The customer can now make payment.', 'Booking Approved');
      fetchMyData();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm booking');
    }
  };

  const handleVerifyPickupScan = async () => {
    if (!scanCode.trim()) return;
    setScanLoading(true);
    setScanSuccessMsg(null);
    setScanErrorMsg(null);
    try {
      const res = await qrService.verifyPickup(scanCode.trim());
      setScanSuccessMsg(res.message);
      success(res.message, 'Pickup Verified');
      setScanCode('');
      fetchMyData();
    } catch (err: any) {
      setScanErrorMsg(err.message || 'Pickup verification failed. Check the pass token.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleVerifyReturnScan = async () => {
    if (!scanCode.trim()) return;
    setScanLoading(true);
    setScanSuccessMsg(null);
    setScanErrorMsg(null);
    try {
      const res = await qrService.verifyReturn(scanCode.trim());
      setScanSuccessMsg(res.message);
      success(res.message, 'Return Complete');
      setScanCode('');
      fetchMyData();
    } catch (err: any) {
      setScanErrorMsg(err.message || 'Return verification failed. Check the pass token.');
    } finally {
      setScanLoading(false);
    }
  };

  // Calculations for owner metric cards
  const activeRentalsCount = bookingRequests.filter(
    (b) => b.status === 'ACTIVE' || b.status === 'CONFIRMED' || b.status === 'READY_FOR_PICKUP'
  ).length;

  const pendingRequestsCount = bookingRequests.filter((b) => b.status === 'RESERVED').length;

  const simulatedRevenue = bookingRequests
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + (curr.rentalTotal || 0), 0);

  return (
    <div className="bg-white rounded-3xl border border-bb-border p-6 sm:p-8 shadow-card mb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-bb-border gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-bb-surface-subtle text-bb-text-primary flex items-center justify-center border border-bb-border shadow-xs">
              <Package className="w-4 h-4 text-bb-accent" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-bb-text-primary">
              Lender Management Portal
            </h2>
          </div>
          <p className="text-xs text-bb-text-secondary">
            Manage your equipment catalog, approve rental requests, and verify pickup & return handovers.
          </p>
        </div>

        {activeTab === 'inventory' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-bb-text-primary hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Equipment</span>
          </motion.button>
        )}
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-6">
        <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
          <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
            <span className="font-bold">Total Listings</span>
            <Package className="w-4 h-4 text-bb-accent" />
          </div>
          <div className="text-2xl font-display font-extrabold text-bb-text-primary">
            {myProducts.length}
          </div>
          <div className="text-[11px] text-bb-text-secondary mt-0.5">
            {myProducts.filter((p) => p.listingStatus === 'ACTIVE').length} active in catalog
          </div>
        </div>

        <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
          <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
            <span className="font-bold">Active Rentals</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-display font-extrabold text-bb-text-primary">
            {activeRentalsCount}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            Currently with customers
          </div>
        </div>

        <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
          <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
            <span className="font-bold">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-display font-extrabold text-bb-text-primary">
            {pendingRequestsCount}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
            Awaiting your approval
          </div>
        </div>

        <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
          <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
            <span className="font-bold">Rental Earnings</span>
            <IndianRupee className="w-4 h-4 text-bb-accent" />
          </div>
          <div className="text-2xl font-display font-extrabold text-bb-text-primary">
            {formatINR(simulatedRevenue)}
          </div>
          <div className="text-[11px] text-bb-text-secondary mt-0.5">
            Accumulated rental revenue
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-bb-surface-subtle rounded-2xl my-5 text-xs font-semibold overflow-x-auto border border-bb-border">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-white text-bb-text-primary shadow-xs font-bold'
              : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          My Listings ({myProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-white text-bb-text-primary shadow-xs font-bold'
              : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Rental Requests ({bookingRequests.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('handover')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'handover'
              ? 'bg-white text-bb-text-primary shadow-xs font-bold'
              : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>QR Scanner & Handover</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: Product Inventory */}
      {activeTab === 'inventory' && (
        loading ? (
          <div className="py-16 text-center text-xs text-bb-text-secondary space-y-2">
            <span className="inline-block w-6 h-6 border-2 border-bb-accent/30 border-t-bb-accent rounded-full animate-spin" />
            <div>Loading your equipment...</div>
          </div>
        ) : myProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-bb-surface-subtle text-bb-text-secondary rounded-2xl flex items-center justify-center mx-auto mb-3 border border-bb-border">
              <Package className="w-7 h-7 text-bb-text-secondary" />
            </div>
            <h4 className="text-sm font-bold text-bb-text-primary">No equipment listed yet</h4>
            <p className="text-xs text-bb-text-secondary mt-1 max-w-sm mx-auto">
              Start earning by listing your unused cameras, laptops, power tools, or sports kits.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-bb-border text-bb-text-secondary font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Equipment</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Daily Rate</th>
                  <th className="pb-3">Deposit</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bb-border">
                {myProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-bb-surface-subtle transition-colors">
                    <td className="py-3.5 pl-2 font-semibold text-bb-text-primary flex items-center gap-3">
                      <img
                        src={
                          p.images?.[0] ||
                          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=120&q=80'
                        }
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-bb-border shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-bb-text-primary truncate max-w-xs">{p.name}</div>
                        <div className="text-[11px] text-bb-text-secondary">{p.location}</div>
                      </div>
                    </td>
                    <td className="py-3.5 text-bb-text-secondary font-medium">{p.category?.name || 'General'}</td>
                    <td className="py-3.5 font-display font-extrabold text-bb-text-primary">
                      {formatINR(p.pricePerDay)}
                    </td>
                    <td className="py-3.5 text-bb-text-secondary font-medium">{formatINR(p.securityDeposit)}</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.listingStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {p.listingStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2 space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-bb-text-secondary hover:text-bb-text-primary hover:bg-bb-surface-subtle rounded-xl transition-colors"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(p.id)}
                        className="p-1.5 text-bb-text-secondary hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Toggle Active Status"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 2: Incoming Rental Requests */}
      {activeTab === 'requests' && (
        loading ? (
          <div className="py-16 text-center text-xs text-bb-text-secondary space-y-2">
            <span className="inline-block w-6 h-6 border-2 border-bb-accent/30 border-t-bb-accent rounded-full animate-spin" />
            <div>Loading booking requests...</div>
          </div>
        ) : bookingRequests.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-bb-surface-subtle text-bb-text-secondary rounded-2xl flex items-center justify-center mx-auto mb-3 border border-bb-border">
              <CalendarCheck className="w-7 h-7 text-bb-text-secondary" />
            </div>
            <h4 className="text-sm font-bold text-bb-text-primary">No rental requests right now</h4>
            <p className="text-xs text-bb-text-secondary mt-1 max-w-sm mx-auto">
              When customers book your equipment, their reservation requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {bookingRequests.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-bb-border bg-white hover:border-slate-300 transition-all shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-bb-text-primary bg-bb-surface-subtle px-2 py-0.5 rounded-lg border border-bb-border">
                      {b.bookingNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bb-accent/10 text-bb-accent border border-bb-accent/20">
                      {b.status}
                    </span>
                  </div>
                  <div className="font-bold text-bb-text-primary text-sm mt-1">{b.product?.name}</div>
                  <div className="text-bb-text-secondary text-[11px] mt-0.5">
                    Customer: <span className="font-bold text-bb-text-primary">{b.customer?.fullName}</span> ({b.customer?.email})
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-bb-text-primary font-display">
                    {formatDateIN(b.startDate)} → {formatDateIN(b.endDate)}
                  </div>
                  <div className="text-[11px] text-bb-text-secondary mt-0.5">
                    Rent: <span className="font-bold text-bb-text-primary">{formatINR(b.rentalTotal)}</span> • Total: <span className="font-bold text-bb-accent">{formatINR(b.totalAmount)}</span>
                  </div>

                  {b.status === 'RESERVED' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleConfirmBooking(b.id)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Booking</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* TAB 3: QR Handover Scanner & Verification */}
      {activeTab === 'handover' && (
        <div className="max-w-xl mx-auto py-4">
          <div className="p-6 sm:p-8 bg-bb-surface-subtle border border-bb-border rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 bg-bb-accent/10 text-bb-accent rounded-2xl flex items-center justify-center mx-auto border border-bb-accent/20 shadow-xs">
              <ScanLine className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-display font-extrabold text-bb-text-primary">
                Digital Pass Verification
              </h3>
              <p className="text-xs text-bb-text-secondary mt-1 max-w-sm mx-auto">
                Scan or paste the customer's Pickup token (`PK-...`) or Return token (`RT-...`) to authorize equipment handover.
              </p>
            </div>

            {scanSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold leading-relaxed">{scanSuccessMsg}</span>
              </motion.div>
            )}

            {scanErrorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium leading-relaxed">{scanErrorMsg}</span>
              </motion.div>
            )}

            <div className="space-y-3 pt-2">
              <input
                type="text"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                placeholder="Enter PK-... or RT-... token code"
                className="w-full px-4 py-3 text-center font-mono font-bold text-sm uppercase tracking-wider bg-white border border-bb-border rounded-2xl focus:border-bb-accent focus:ring-4 focus:ring-bb-accent/10 focus:outline-none transition-all placeholder:text-bb-text-secondary placeholder:normal-case placeholder:font-sans text-bb-text-primary"
              />

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  disabled={scanLoading || !scanCode.trim()}
                  onClick={handleVerifyPickupScan}
                  className="py-3 px-4 bg-bb-text-primary hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-40"
                >
                  {scanLoading ? 'Checking...' : 'Verify Pickup (Start Rental)'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  disabled={scanLoading || !scanCode.trim()}
                  onClick={handleVerifyReturnScan}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-40"
                >
                  {scanLoading ? 'Checking...' : 'Verify Return (Release Deposit)'}
                </motion.button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-bb-text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Handover Pass • Automated Deposit Escrow</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding / Editing */}
      <AddEditProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        productToEdit={editingProduct}
        onSuccess={() => {
          fetchMyData();
          onRefreshProducts();
        }}
      />
    </div>
  );
};
