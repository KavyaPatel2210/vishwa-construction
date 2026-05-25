import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { PageLoader } from '../components/common/LoadingSpinner';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import { formatCurrency } from '../utils/amountToWords';
import toast from 'react-hot-toast';

function StatCard({ title, value, subtitle, icon, gradient }) {
  return (
    <div className={`${gradient} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-white/80 text-sm font-medium">{title}</div>
      {subtitle && <div className="text-white/60 text-xs mt-1">{subtitle}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <MainLayout><PageLoader /></MainLayout>;

  return (
    <MainLayout>
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Hello, {user?.contractorName?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">{user?.companyName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          gradient="stat-blue"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          title="Total Invoices"
          value={stats?.totalBills || 0}
          gradient="stat-purple"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          gradient="stat-green"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          gradient="stat-orange"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
        />
      </div>

      {/* Quick Action */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Create New Invoice</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Generate a professional bill instantly</p>
          </div>
          <Link to="/invoices/create" className="btn-primary flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Invoices</h3>
            <Link to="/invoices" className="text-primary-600 text-sm font-medium hover:underline">View all</Link>
          </div>
          {stats?.recentInvoices?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInvoices.map(inv => (
                <div
                  key={inv._id}
                  onClick={() => navigate(`/invoices/${inv._id}`)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{inv.customerName}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Bill #{inv.billNumber} · {formatDate(inv.date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(inv.grandTotal || inv.totalAmount)}</p>
                    <span className={inv.status === 'Paid' ? 'badge-paid' : 'badge-pending'}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 mx-auto mb-2 opacity-40">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-sm">No invoices yet</p>
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Customers</h3>
            <Link to="/customers" className="text-primary-600 text-sm font-medium hover:underline">View all</Link>
          </div>
          {stats?.recentCustomers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCustomers.map(cust => (
                <div
                  key={cust._id}
                  onClick={() => navigate(`/customers/${cust._id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                    {cust.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{cust.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{cust.mobile || cust.address || '—'}</p>
                  </div>
                  <div className="flex-shrink-0 ml-auto">
                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      Bill #{cust.nextBillNumber - 1 > 0 ? cust.nextBillNumber - 1 : 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 mx-auto mb-2 opacity-40">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="text-sm">No customers yet</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
