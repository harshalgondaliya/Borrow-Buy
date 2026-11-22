import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlatformStats,
  AdminUser,
  AdminDispute,
  adminService,
} from '../../services/admin';
import { formatINR, formatDateIN } from '../../utils/formatters';
import {
  ShieldAlert,
  Users,
  Package,
  CheckCircle2,
  Scale,
  ShieldCheck,
  CalendarDays,
  AlertCircle,
  X,
  IndianRupee,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'disputes' | 'bookings'>('stats');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dispute resolution modal state
  const [resolvingDispute, setResolvingDispute] = useState<AdminDispute | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [deductedAmount, setDeductedAmount] = useState('0');

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, disputesRes, bookingsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getDisputes(),
        adminService.getAllBookings(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDisputes(disputesRes.data);
      setBookings(bookingsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(user.id, { status: nextStatus });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleToggleVerifyOwner = async (user: AdminUser) => {
    try {
      await adminService.updateUserStatus(user.id, { isVerifiedOwner: !user.isVerifiedOwner });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle owner verification');
    }
  };

  const handleResolveDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingDispute) return;
    try {
      await adminService.resolveDispute(resolvingDispute.id, {
        status: 'RESOLVED',
        resolutionNotes,
        deductedFromDeposit: parseFloat(deductedAmount) || 0,
      });
      setResolvingDispute(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve dispute');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-bb-border p-6 sm:p-8 shadow-card mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-bb-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-bb-text-primary">
              Platform Administration Console
            </h2>
          </div>
          <p className="text-xs text-bb-text-secondary">
            Platform governance, financial escrow ledger, member moderation, and damage claim resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 bg-bb-surface-subtle text-bb-text-primary text-xs font-bold rounded-xl border border-bb-border flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bb-accent animate-pulse" />
            <span>Admin: {users.find(u => u.role === 'ADMIN')?.email || 'admin@borrowbuy.in'}</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-bb-surface-subtle rounded-2xl my-5 text-xs font-semibold overflow-x-auto border border-bb-border">
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-white text-bb-text-primary shadow-xs font-bold'
              : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          Platform Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white text-bb-text-primary shadow-xs font-bold'
              : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          Users & Verification ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('disputes')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'disputes'
              ? 'bg-white text-bb-text-primary shadow-xs font-bold'
              : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Disputes & Claims ({disputes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'bg-white text-bb-text-primary shadow-xs font-bold'
              : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Rental Ledger ({bookings.length})</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-bb-text-secondary space-y-2">
          <span className="inline-block w-6 h-6 border-2 border-bb-accent/30 border-t-bb-accent rounded-full animate-spin" />
          <div>Syncing administration database...</div>
        </div>
      ) : (
        <>
          {/* TAB 1: Platform Analytics */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
                  <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
                    <span className="font-bold">Total Accounts</span>
                    <Users className="w-4 h-4 text-bb-accent" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-bb-text-primary">
                    {stats.users.total}
                  </div>
                  <div className="text-[11px] text-bb-text-secondary mt-0.5">
                    {stats.users.owners} Lenders • {stats.users.customers} Renters
                  </div>
                </div>

                <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
                  <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
                    <span className="font-bold">Catalog Listings</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-bb-text-primary">
                    {stats.products.total}
                  </div>
                  <div className="text-[11px] text-bb-text-secondary mt-0.5">
                    {stats.products.pendingApproval} Pending Review
                  </div>
                </div>

                <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
                  <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
                    <span className="font-bold">Rental Volume</span>
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-bb-text-primary">
                    {stats.bookings.completed + stats.bookings.active}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    {stats.bookings.active} Active • {stats.bookings.completed} Completed
                  </div>
                </div>

                <div className="p-4 bg-bb-surface-subtle border border-bb-border rounded-2xl">
                  <div className="flex items-center justify-between text-bb-text-secondary text-xs mb-1">
                    <span className="font-bold">Gross Volume</span>
                    <IndianRupee className="w-4 h-4 text-bb-accent" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-bb-text-primary">
                    {formatINR(stats.financials.grossSimulatedVolume)}
                  </div>
                  <div className="text-[11px] text-bb-text-secondary mt-0.5">
                    Escrow Held: {formatINR(stats.financials.depositsHeld)}
                  </div>
                </div>
              </div>

              {/* Financial Ledger Card */}
              <div className="p-6 bg-bb-text-primary text-white rounded-3xl shadow-xl border border-bb-text-primary relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-display font-extrabold tracking-tight flex items-center gap-2 text-white">
                    <IndianRupee className="w-4 h-4 text-bb-accent" />
                    <span>Simulated Escrow Financial Ledger</span>
                  </h3>
                  <span className="text-[10px] text-blue-200 font-mono uppercase tracking-widest px-2.5 py-1 bg-white/10 rounded-lg">
                    Real-Time Settlement
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] mb-1">Total Rental Fees</span>
                    <span className="text-lg font-display font-extrabold text-blue-200">
                      {formatINR(stats.financials.totalRentalFees)}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] mb-1">Active Escrow Deposits</span>
                    <span className="text-lg font-display font-extrabold text-amber-300">
                      {formatINR(stats.financials.depositsHeld)}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] mb-1">Refunded Deposits</span>
                    <span className="text-lg font-display font-extrabold text-emerald-300">
                      {formatINR(stats.financials.depositsRefunded)}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] mb-1">Damage Deductions</span>
                    <span className="text-lg font-display font-extrabold text-rose-300">
                      {formatINR(stats.financials.damageDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: User Moderation */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-bb-border text-bb-text-secondary font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">User Persona</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Account Status</th>
                    <th className="pb-3">Verified Owner</th>
                    <th className="pb-3">Trust Score</th>
                    <th className="pb-3 text-right pr-2">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bb-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-bb-surface-subtle transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="font-bold text-bb-text-primary">{u.fullName}</div>
                        <div className="text-[11px] text-bb-text-secondary font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-bb-surface-subtle text-bb-text-primary border border-bb-border">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {u.isVerifiedOwner ? (
                          <span className="text-bb-accent font-bold flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-bb-accent" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-bb-text-secondary text-[11px]">Unverified</span>
                        )}
                      </td>
                      <td className="py-3.5 font-display font-extrabold text-bb-text-primary">
                        ⭐ {u.trustScore.toFixed(1)} <span className="text-bb-text-secondary font-normal">/ 5.0</span>
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-1.5">
                        <button
                          onClick={() => handleToggleVerifyOwner(u)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-bb-accent hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                          title="Toggle Owner Verification"
                        >
                          {u.isVerifiedOwner ? 'Revoke' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Disputes Mediation */}
          {activeTab === 'disputes' && (
            disputes.length === 0 ? (
              <div className="py-16 text-center text-xs text-bb-text-secondary">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-bb-text-primary">Zero active disputes</h4>
                <p className="text-xs text-bb-text-secondary mt-0.5">
                  All equipment rentals have been concluded without damage claims.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((d) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-bb-border bg-white shadow-card space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-bb-text-primary text-sm">{d.reason}</span>
                        <span className="font-mono text-[11px] text-bb-text-secondary bg-bb-surface-subtle px-2 py-0.5 rounded-lg border border-bb-border">
                          Ref: {d.booking?.bookingNumber}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {d.status}
                      </span>
                    </div>

                    <p className="text-bb-text-secondary leading-relaxed italic bg-bb-surface-subtle p-3 rounded-xl border border-bb-border">
                      "{d.description}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-bb-border">
                      <div>
                        Claimed Deduction: <span className="font-display font-extrabold text-rose-600">{formatINR(d.claimAmount)}</span> • Raised by: <span className="font-semibold text-bb-text-primary">{d.raisedBy?.fullName}</span>
                      </div>

                      {d.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingDispute(d);
                            setDeductedAmount(d.claimAmount.toString());
                            setResolutionNotes('');
                          }}
                          className="px-3.5 py-1.5 bg-bb-text-primary hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                        >
                          Mediate & Settle Claim
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* TAB 4: Bookings Ledger */}
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-bb-border text-bb-text-secondary font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Booking Ref</th>
                    <th className="pb-3">Equipment</th>
                    <th className="pb-3">Renter</th>
                    <th className="pb-3">Rental Schedule</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bb-border">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-bb-surface-subtle transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-bold text-bb-text-primary">
                        {b.bookingNumber}
                      </td>
                      <td className="py-3.5 font-bold text-bb-text-primary">{b.product?.name}</td>
                      <td className="py-3.5 text-bb-text-secondary font-medium">{b.customer?.fullName}</td>
                      <td className="py-3.5 text-bb-text-secondary">
                        {formatDateIN(b.startDate)} → {formatDateIN(b.endDate)}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-bb-surface-subtle text-bb-text-primary border border-bb-border">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2 font-display font-extrabold text-bb-text-primary">
                        {formatINR(b.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Dispute Resolution Modal */}
      <AnimatePresence>
        {resolvingDispute && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResolvingDispute(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-bb-border z-10"
            >
              <button
                onClick={() => setResolvingDispute(null)}
                className="absolute top-5 right-5 text-bb-text-secondary hover:text-bb-text-primary p-2 rounded-xl hover:bg-bb-surface-subtle transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                  <Scale className="w-3.5 h-3.5" />
                  Arbitration Dock
                </span>
                <h3 className="text-xl font-display font-extrabold text-bb-text-primary">
                  Mediate Damage Dispute
                </h3>
                <p className="text-xs text-bb-text-secondary font-mono mt-0.5">
                  Ref: {resolvingDispute.booking?.bookingNumber}
                </p>
              </div>

              <form onSubmit={handleResolveDisputeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-bb-text-primary mb-1.5">
                    Deduction from Security Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={deductedAmount}
                    onChange={(e) => setDeductedAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-bb-border rounded-xl focus:border-bb-accent focus:ring-4 focus:ring-bb-accent/10 focus:outline-none transition-all font-display font-bold text-sm text-bb-text-primary"
                  />
                  <span className="text-[11px] text-bb-text-secondary mt-1 block">
                    Any remaining deposit will be automatically released back to the customer.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-bb-text-primary mb-1.5">
                    Arbitration Reason & Notes *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document the mediated outcome and reasoning for both parties..."
                    className="w-full px-3.5 py-2.5 border border-bb-border rounded-xl focus:border-bb-accent focus:ring-4 focus:ring-bb-accent/10 focus:outline-none transition-all text-bb-text-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolvingDispute(null)}
                    className="px-4 py-2 text-xs font-bold text-bb-text-secondary hover:text-bb-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-bb-accent hover:bg-bb-accent-hover text-white font-bold rounded-xl shadow-sm transition-all text-xs"
                  >
                    Confirm Arbitration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
