import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { PageLoader } from '../components/common/LoadingSpinner';
import { customerService } from '../services/customerService';
import { invoiceService } from '../services/invoiceService';
import { formatDate } from '../utils/dateFormatter';
import { formatCurrency } from '../utils/amountToWords';
import toast from 'react-hot-toast';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      customerService.getById(id),
      invoiceService.getAll({ customerId: id })
    ]).then(([custRes, invRes]) => {
      setCustomer(custRes.data.data);
      setInvoices(invRes.data.data);
    }).catch(() => { toast.error('Failed to load'); navigate('/customers'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusToggle = async (inv) => {
    const newStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      await invoiceService.update(inv._id, { status: newStatus });
      setInvoices(prev => prev.map(i => i._id === inv._id ? { ...i, status: newStatus } : i));
      toast.success(`Marked as ${newStatus}`);
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <MainLayout><PageLoader /></MainLayout>;
  if (!customer) return null;

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || inv.totalAmount || 0), 0);
  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const totalEarnings = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + (inv.grandTotal || inv.totalAmount || 0), 0);

  return (
    <MainLayout>
      {/* Back */}
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-primary-600 mb-5 text-sm font-medium">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Customers
      </button>

      {/* Customer Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-2xl">
              {customer.name[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{customer.name}</h2>
              {customer.mobile && <p className="text-gray-500 dark:text-slate-400 text-sm">{customer.mobile}</p>}
              {customer.pan && <p className="text-xs font-mono text-gray-600 dark:text-slate-300 mt-1">PAN: {customer.pan}</p>}
              {customer.address && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{customer.address}</p>}
            </div>
          </div>
          <Link to={`/invoices/create?customerId=${customer._id}`} className="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Invoice
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{invoices.length}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Total Bills ({paidCount} Paid)</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Total Billed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">{formatCurrency(totalEarnings)}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Paid</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold truncate ${totalRevenue - totalEarnings > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>{formatCurrency(totalRevenue - totalEarnings)}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Total Pending</p>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Invoice History</h3>
      {invoices.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          <p>No invoices for this customer yet</p>
          <Link to={`/invoices/create?customerId=${customer._id}`} className="btn-primary mt-4 mx-auto">
            Create First Invoice
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv._id} className="card p-4 flex items-center gap-4">
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/invoices/${inv._id}`)}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-gray-900 dark:text-white">Bill #{inv.billNumber}</span>
                  <span className={inv.status === 'Paid' ? 'badge-paid' : 'badge-pending'}>{inv.status}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{formatDate(inv.date)}</p>
                {inv.items?.slice(0, 1).map((item, i) => (
                  <p key={i} className="text-xs text-gray-600 dark:text-slate-300 mt-1 truncate">{item.description}</p>
                ))}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(inv.grandTotal || inv.totalAmount)}</p>
                <button
                  onClick={() => handleStatusToggle(inv)}
                  className="text-xs text-primary-600 hover:underline mt-1"
                >
                  Mark {inv.status === 'Paid' ? 'Pending' : 'Paid'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
