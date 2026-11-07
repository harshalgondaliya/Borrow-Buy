import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlatformStats,
  AdminUser,
  AdminDispute,
  adminService,
} from '../../services/admin';
import {
  ShieldAlert,
  Users,
  Package,
  DollarSign,
  CheckCircle2,
  Scale,
  ShieldCheck,
  CalendarDays,
  AlertCircle,
  X,
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
      setError(err.message || 'Failed to load administrator data');
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
    <div className="bg-white rounded-3xl border border-charcoal-200/80 p-6 sm:p-8 shadow-card mb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-charcoal-900">
              Platform Governance Console
            </h2>
          </div>
          <p className="text-xs text-charcoal-500">
            Audit system operations, simulate financial escrow ledger, moderate users, and resolve damage claims.
          </p>
        </div>

        <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 self-start sm:self-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Admin Root Session</span>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-charcoal-100/80 rounded-2xl my-5 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-white text-charcoal-900 shadow-sm font-bold'
              : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Platform Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white text-charcoal-900 shadow-sm font-bold'
              : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Users & Verification ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('disputes')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'disputes'
              ? 'bg-white text-charcoal-900 shadow-sm font-bold'
              : 'text-charcoal-500 hover:text-charcoal-800'
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
              ? 'bg-white text-charcoal-900 shadow-sm font-bold'
              : 'text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Ledger History ({bookings.length})</span>
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
        <div className="py-16 text-center text-xs text-charcoal-400 space-y-2">
          <span className="inline-block w-6 h-6 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
          <div>Syncing administration database...</div>
        </div>
      ) : (
        <>
          {/* TAB 1: Platform Analytics */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 bg-charcoal-50/70 border border-charcoal-200/70 rounded-2xl">
                  <div className="flex items-center justify-between text-charcoal-500 text-xs mb-1">
                    <span className="font-bold">Total Accounts</span>
                    <Users className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-charcoal-900">
                    {stats.users.total}
                  </div>
                  <div className="text-[11px] text-charcoal-500 mt-0.5">
                    {stats.users.owners} Owners • {stats.users.customers} Renters
                  </div>
                </div>

                <div className="p-4 bg-charcoal-50/70 border border-charcoal-200/70 rounded-2xl">
                  <div className="flex items-center justify-between text-charcoal-500 text-xs mb-1">
                    <span className="font-bold">Equipment Catalog</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-charcoal-900">
                    {stats.products.total}
                  </div>
                  <div className="text-[11px] text-charcoal-500 mt-0.5">
                    {stats.products.pendingApproval} Pending Verification
                  </div>
                </div>

                <div className="p-4 bg-charcoal-50/70 border border-charcoal-200/70 rounded-2xl">
                  <div className="flex items-center justify-between text-charcoal-500 text-xs mb-1">
                    <span className="font-bold">Rental Volume</span>
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-charcoal-900">
                    {stats.bookings.completed + stats.bookings.active}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    {stats.bookings.active} In Hand • {stats.bookings.completed} Returned
                  </div>
                </div>

                <div className="p-4 bg-charcoal-50/70 border border-charcoal-200/70 rounded-2xl">
                  <div className="flex items-center justify-between text-charcoal-500 text-xs mb-1">
                    <span className="font-bold">Simulated Gross</span>
                    <DollarSign className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="text-2xl font-display font-extrabold text-charcoal-900">
                    ${stats.financials.grossSimulatedVolume.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-charcoal-500 mt-0.5">
                    Deposits Held: ${stats.financials.depositsHeld.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Obsidian Ledger Card */}
              <div className="p-6 bg-gradient-to-tr from-charcoal-950 via-charcoal-900 to-brand-950 text-white rounded-3xl shadow-elevated border border-charcoal-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-display font-extrabold tracking-tight flex items-center gap-2 text-white">
                    <DollarSign className="w-4 h-4 text-brand-400" />
                    <span>Simulated Escrow Financial Ledger</span>
                  </h3>
                  <span className="text-[10px] text-brand-300 font-mono uppercase tracking-widest px-2.5 py-1 bg-white/10 rounded-lg">
                    Real-Time Settlement
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-charcoal-400 block text-[11px] mb-1">Gross Rental Fees</span>
                    <span className="text-lg font-display font-extrabold text-brand-300">
                      ${stats.financials.totalRentalFees.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-charcoal-400 block text-[11px] mb-1">Active Escrow Deposits</span>
                    <span className="text-lg font-display font-extrabold text-amber-300">
                      ${stats.financials.depositsHeld.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-charcoal-400 block text-[11px] mb-1">Refunded Deposits</span>
                    <span className="text-lg font-display font-extrabold text-emerald-300">
                      ${stats.financials.depositsRefunded.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-charcoal-400 block text-[11px] mb-1">Damage Deductions</span>
                    <span className="text-lg font-display font-extrabold text-rose-300">
                      ${stats.financials.damageDeductions.toFixed(2)}
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
                  <tr className="border-b border-charcoal-200 text-charcoal-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">User Persona</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Account Status</th>
                    <th className="pb-3">Verified Owner</th>
                    <th className="pb-3">Trust Score</th>
                    <th className="pb-3 text-right pr-2">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-charcoal-50/70 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="font-bold text-charcoal-900">{u.fullName}</div>
                        <div className="text-[11px] text-charcoal-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-charcoal-100 text-charcoal-700">
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
                          <span className="text-brand-600 font-bold flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-charcoal-400 text-[11px]">Unverified</span>
                        )}
                      </td>
                      <td className="py-3.5 font-display font-extrabold text-charcoal-900">
                        ⭐ {u.trustScore.toFixed(1)} <span className="text-charcoal-400 font-normal">/ 5.0</span>
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-1.5">
                        <button
                          onClick={() => handleToggleVerifyOwner(u)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
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
              <div className="py-16 text-center text-xs text-charcoal-400">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-charcoal-800">Zero open disputes</h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  All equipment rentals have been settled without damage claims.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((d) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-charcoal-200/80 bg-white shadow-card space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-charcoal-900 text-sm">{d.reason}</span>
                        <span className="font-mono text-[11px] text-charcoal-500 bg-charcoal-50 px-2 py-0.5 rounded-lg border border-charcoal-200">
                          Ref: {d.booking?.bookingNumber}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {d.status}
                      </span>
                    </div>

                    <p className="text-charcoal-600 leading-relaxed italic bg-charcoal-50 p-3 rounded-xl border border-charcoal-100">
                      "{d.description}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-charcoal-100">
                      <div>
                        Claimed Deduction: <span className="font-display font-extrabold text-rose-600">${d.claimAmount}</span> • Raised by: <span className="font-semibold text-charcoal-800">{d.raisedBy?.fullName}</span>
                      </div>

                      {d.status === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingDispute(d);
                            setDeductedAmount(d.claimAmount.toString());
                            setResolutionNotes('');
                          }}
                          className="px-3.5 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
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
                  <tr className="border-b border-charcoal-200 text-charcoal-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Booking Ref</th>
                    <th className="pb-3">Equipment</th>
                    <th className="pb-3">Renter</th>
                    <th className="pb-3">Rental Schedule</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Total Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-charcoal-50/70 transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-bold text-charcoal-900">
                        {b.bookingNumber}
                      </td>
                      <td className="py-3.5 font-bold text-charcoal-900">{b.product?.name}</td>
                      <td className="py-3.5 text-charcoal-600 font-medium">{b.customer?.fullName}</td>
                      <td className="py-3.5 text-charcoal-600">
                        {new Date(b.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} →{' '}
                        {new Date(b.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-charcoal-100 text-charcoal-800">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2 font-display font-extrabold text-charcoal-900">
                        ${b.totalAmount}
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
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResolvingDispute(null)}
              className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-elevated border border-charcoal-100 z-10"
            >
              <button
                onClick={() => setResolvingDispute(null)}
                className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-2 rounded-xl hover:bg-charcoal-100/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                  <Scale className="w-3.5 h-3.5" />
                  Arbitration Dock
                </span>
                <h3 className="text-xl font-display font-extrabold text-charcoal-900">
                  Mediate Damage Dispute
                </h3>
                <p className="text-xs text-charcoal-500 font-mono mt-0.5">
                  Ref: {resolvingDispute.booking?.bookingNumber}
                </p>
              </div>

              <form onSubmit={handleResolveDisputeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1.5">
                    Deduction from Security Deposit ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={deductedAmount}
                    onChange={(e) => setDeductedAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all font-display font-bold text-sm"
                  />
                  <span className="text-[11px] text-charcoal-400 mt-1 block">
                    Remaining deposit balance will be automatically disbursed back to the renter.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1.5">
                    Official Arbitration Reasoning *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document the mediated outcome and findings for both parties..."
                    className="w-full px-3.5 py-2.5 border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolvingDispute(null)}
                    className="px-4 py-2 text-xs font-bold text-charcoal-500 hover:text-charcoal-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl shadow-card transition-all text-xs"
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
