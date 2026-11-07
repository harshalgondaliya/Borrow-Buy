import React, { useEffect, useState } from 'react';
import { Product, productsService, Category } from '../../services/products';
import { Booking, bookingsService } from '../../services/bookings';
import { qrService } from '../../services/qr';
import { useToast } from '../../features/toast/ToastContext';
import { Plus, Edit2, PowerOff, Package, AlertCircle, CalendarCheck, CheckCircle2, ScanLine } from 'lucide-react';
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
      setError(err.message || 'Failed to load owner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleDeactivate = async (productId: string) => {
    if (!confirm('Are you sure you want to toggle this listing status?')) return;
    try {
      await productsService.deleteProduct(productId);
      fetchMyData();
      onRefreshProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate listing');
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await bookingsService.confirmBooking(bookingId);
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
      success(res.message, 'Handover Active');
      setScanCode('');
      fetchMyData();
    } catch (err: any) {
      setScanErrorMsg(err.message || 'Pickup verification failed');
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
      setScanErrorMsg(err.message || 'Return verification failed');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-bold text-slate-900">Owner Management Portal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your equipment inventory, approve rental requests, and verify QR handover passes.
          </p>
        </div>

        {activeTab === 'inventory' && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            Add New Listing
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 my-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2.5 px-4 border-b-2 transition shrink-0 ${
            activeTab === 'inventory'
              ? 'border-sky-600 text-sky-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Listings ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2.5 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'requests'
              ? 'border-sky-600 text-sky-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Rental Requests ({bookingRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('handover')}
          className={`pb-2.5 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'handover'
              ? 'border-sky-600 text-sky-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>QR Scanner & Handover</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Product Inventory */}
      {activeTab === 'inventory' && (
        loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your listings...</div>
        ) : myProducts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No products listed yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Put your unused tools, cameras, and equipment to work by creating your first listing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Daily Rate</th>
                  <th className="pb-3">Deposit</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 pl-2 font-semibold text-slate-900 flex items-center gap-2.5">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <div className="line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.location}</div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{p.category?.name || 'General'}</td>
                    <td className="py-3 font-bold text-slate-900">${p.pricePerDay}</td>
                    <td className="py-3 text-slate-600">${p.securityDeposit}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.listingStatus === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.listingStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2 space-x-1">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Deactivate / Toggle"
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

      {/* Tab 2: Incoming Booking Requests */}
      {activeTab === 'requests' && (
        loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading incoming requests...</div>
        ) : bookingRequests.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No booking requests yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When customers request to rent your equipment, they will appear here for your review and approval.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookingRequests.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{b.bookingNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      {b.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 mt-1">{b.product?.name}</div>
                  <div className="text-slate-500 text-[11px]">
                    Customer: <span className="font-semibold text-slate-700">{b.customer?.fullName}</span> ({b.customer?.email})
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Rental: <span className="font-bold text-slate-800">${b.rentalTotal}</span> • Total: <span className="font-bold text-sky-600">${b.totalAmount}</span>
                  </div>

                  {b.status === 'RESERVED' && (
                    <button
                      onClick={() => handleConfirmBooking(b.id)}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 3: QR Handover Scanner & Verification */}
      {activeTab === 'handover' && (
        <div className="max-w-xl mx-auto py-4">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">QR Token Handover Verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan or paste the customer's single-use Pickup token (`PK-...`) or Return token (`RT-...`) to authorize the handover.
              </p>
            </div>

            {scanSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{scanSuccessMsg}</span>
              </div>
            )}

            {scanErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scanErrorMsg}</span>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <input
                type="text"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                placeholder="Enter PK-... or RT-... token code"
                className="w-full px-4 py-2.5 text-center font-mono text-sm uppercase tracking-wider border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={scanLoading || !scanCode.trim()}
                  onClick={handleVerifyPickupScan}
                  className="py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {scanLoading ? 'Verifying...' : 'Verify Pickup (Activate)'}
                </button>
                <button
                  type="button"
                  disabled={scanLoading || !scanCode.trim()}
                  onClick={handleVerifyReturnScan}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {scanLoading ? 'Verifying...' : 'Verify Return (Complete)'}
                </button>
              </div>
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
