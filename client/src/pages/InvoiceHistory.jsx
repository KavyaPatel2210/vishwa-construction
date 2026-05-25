import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { PageLoader } from '../components/common/LoadingSpinner';
import { invoiceService } from '../services/invoiceService';
import { customerService } from '../services/customerService';
import { formatDate } from '../utils/dateFormatter';
import { formatCurrency } from '../utils/amountToWords';
import toast from 'react-hot-toast';

export default function InvoiceHistory() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', customerId: '', status: '', startDate: '', endDate: '' });
  const [deleting, setDeleting] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await invoiceService.getAll(filters);
      setInvoices(res.data.data);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { customerService.getAll().then(r => setCustomers(r.data.data)); }, []);

  useEffect(() => {
    const t = setTimeout(fetchInvoices, 400);
    return () => clearTimeout(t);
  }, [filters]);

  const setFilter = (key) => (e) => setFilters(p => ({ ...p, [key]: e.target.value }));

  const handleDelete = async (id) => {
    try {
      await invoiceService.delete(id);
      toast.success('Invoice deleted');
      setDeleting(null);
      fetchInvoices();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDuplicate = async (id) => {
    try {
      await invoiceService.duplicate(id);
      toast.success('Invoice duplicated!');
      fetchInvoices();
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleStatusToggle = async (inv) => {
    const newStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      await invoiceService.update(inv._id, { status: newStatus });
      setInvoices(prev => prev.map(i => i._id === inv._id ? { ...i, status: newStatus } : i));
      toast.success(`Marked as ${newStatus}`);
    } catch { toast.error('Update failed'); }
  };

  const clearFilters = () => setFilters({ search: '', customerId: '', status: '', startDate: '', endDate: '' });

  if (loading) return <MainLayout><PageLoader /></MainLayout>;

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2 className="page-title">Invoice History</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{invoices.length} invoices</p>
        </div>
        <button onClick={() => navigate('/invoices/create')} className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 space-y-3">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="form-input pl-11" placeholder="Search customer or bill number..." value={filters.search} onChange={setFilter('search')} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select className="form-input text-sm" value={filters.customerId} onChange={setFilter('customerId')}>
            <option value="">All Customers</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="form-input text-sm" value={filters.status} onChange={setFilter('status')}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
          <input type="date" className="form-input text-sm" value={filters.startDate} onChange={setFilter('startDate')} placeholder="Start date" />
          <input type="date" className="form-input text-sm" value={filters.endDate} onChange={setFilter('endDate')} placeholder="End date" />
        </div>
        {Object.values(filters).some(Boolean) && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear filters</button>
        )}
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary-500">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">No invoices found</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
            {Object.values(filters).some(Boolean) ? 'Try different filters' : 'Create your first invoice'}
          </p>
          <button onClick={() => navigate('/invoices/create')} className="btn-primary mx-auto">Create Invoice</button>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv._id} className="card p-4">
              <div className="flex items-start gap-4">
                {/* Invoice icon */}
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 dark:text-primary-400 font-bold text-sm">#{inv.billNumber}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/invoices/${inv._id}`)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{inv.customerName}</h4>
                    <span className={inv.status === 'Paid' ? 'badge-paid' : 'badge-pending'}>{inv.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{formatDate(inv.date)}</p>
                  {inv.items?.[0] && (
                    <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 truncate">{inv.items[0].description}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(inv.grandTotal || inv.totalAmount)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex-wrap">
                <button onClick={() => navigate(`/invoices/${inv._id}`)} className="btn-secondary text-xs py-1.5 px-3">
                  View
                </button>
                {inv.status !== 'Paid' && (
                  <button onClick={() => navigate(`/invoices/${inv._id}/edit`)} className="btn-primary text-xs py-1.5 px-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                )}
                <button onClick={() => handleStatusToggle(inv)} className="btn-secondary text-xs py-1.5 px-3">
                  {inv.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                </button>
                <button onClick={() => handleDuplicate(inv._id)} className="btn-secondary text-xs py-1.5 px-3">
                  Duplicate
                </button>
                <button onClick={() => setDeleting(inv._id)} className="btn-danger text-xs py-1.5 px-3">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleting(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delete Invoice?</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleting)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
