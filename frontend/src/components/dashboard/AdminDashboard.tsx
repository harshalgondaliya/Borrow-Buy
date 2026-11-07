import React, { useEffect, useState } from 'react';
import { 
  PlatformStats, 
  AdminUser, 
  AdminDispute, 
  adminService 
} from '../../services/admin';
import { 
  ShieldAlert, 
  Users, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  Scale, 
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'disputes' | 'products' | 'bookings'>('stats');
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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">Administrator Console</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            System governance, financial simulation audit, user moderation, and dispute arbitration.
          </p>
        </div>

        <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 self-start sm:self-auto">
          Admin Privilege Active
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 my-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-2.5 px-4 border-b-2 transition shrink-0 ${
            activeTab === 'stats' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-4 border-b-2 transition shrink-0 ${
            activeTab === 'users' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Users & Verification ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`pb-2.5 px-4 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'disputes' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Disputes & Claims ({disputes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-2.5 px-4 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
            activeTab === 'bookings' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Bookings Ledger ({bookings.length})</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading admin console...</div>
      ) : (
        <>
          {/* TAB 1: Platform Analytics */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>Total Registered Users</span>
                    <Users className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.users.total}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {stats.users.owners} Owners • {stats.users.customers} Renters
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>Product Catalog</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.products.total}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {stats.products.pendingApproval} Pending Review
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>Rentals Activity</span>
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.bookings.completed + stats.bookings.active}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {stats.bookings.active} Active Now • {stats.bookings.completed} Completed
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>Simulated Volume</span>
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    ${stats.financials.grossSimulatedVolume.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Deposits: ${stats.financials.depositsHeld.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-3xl shadow-sm">
                <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-sky-400" />
                  Simulated Financial Ledger Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Rental Revenue</span>
                    <span className="text-lg font-bold text-sky-300">${stats.financials.totalRentalFees.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Deposits Held</span>
                    <span className="text-lg font-bold text-amber-300">${stats.financials.depositsHeld.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Deposits Refunded</span>
                    <span className="text-lg font-bold text-emerald-300">${stats.financials.depositsRefunded.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Damage Claim Deductions</span>
                    <span className="text-lg font-bold text-rose-300">${stats.financials.damageDeductions.toFixed(2)}</span>
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
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">User</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Verified Owner</th>
                    <th className="pb-3">Trust Score</th>
                    <th className="pb-3 text-right pr-2">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 pl-2">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.isVerifiedOwner ? (
                          <span className="text-sky-600 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-slate-400">Unverified</span>
                        )}
                      </td>
                      <td className="py-3 font-bold text-slate-800">{u.trustScore.toFixed(1)} / 5.0</td>
                      <td className="py-3 text-right pr-2 space-x-1">
                        <button
                          onClick={() => handleToggleVerifyOwner(u)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition"
                          title="Toggle Owner Verification"
                        >
                          {u.isVerifiedOwner ? 'Revoke Owner' : 'Verify Owner'}
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
              <div className="py-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No active disputes or damage claims!
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((d) => (
                  <div key={d.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{d.reason}</span>
                        <span className="font-mono text-[11px] text-slate-500">Ref: {d.booking?.bookingNumber}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {d.status}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed italic">"{d.description}"</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div>
                        Claimed Amount: <span className="font-bold text-rose-600">${d.claimAmount}</span> • Raised by: {d.raisedBy?.fullName}
                      </div>

                      {d.status === 'OPEN' && (
                        <button
                          onClick={() => {
                            setResolvingDispute(d);
                            setDeductedAmount(d.claimAmount.toString());
                            setResolutionNotes('');
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition"
                        >
                          Mediate & Settle Claim
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 4: Bookings Ledger */}
          {activeTab === 'bookings' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Ref</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 pl-2 font-mono font-bold text-slate-900">{b.bookingNumber}</td>
                      <td className="py-3 font-semibold text-slate-800">{b.product?.name}</td>
                      <td className="py-3 text-slate-600">{b.customer?.fullName}</td>
                      <td className="py-3 text-slate-600">
                        {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 font-bold text-slate-900">${b.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Dispute Resolution Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Mediate Damage Dispute</h3>
            <p className="text-xs text-slate-500 mb-4">
              Booking Ref: {resolvingDispute.booking?.bookingNumber}
            </p>

            <form onSubmit={handleResolveDisputeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deduction from Security Deposit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={deductedAmount}
                  onChange={(e) => setDeductedAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Any remaining deposit will be automatically released to the renter.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Arbitration Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain the mediated outcome and reasoning for both parties..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setResolvingDispute(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow transition"
                >
                  Confirm Arbitration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
