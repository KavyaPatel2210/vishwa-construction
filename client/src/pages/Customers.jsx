import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Modal from '../components/common/Modal';
import { PageLoader } from '../components/common/LoadingSpinner';
import { customerService } from '../services/customerService';
import { formatCurrency } from '../utils/amountToWords';
import toast from 'react-hot-toast';

const EMPTY = { name: '', address: '', pan: '', mobile: '', notes: '' };

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCustomers = async (q = '') => {
    try {
      const res = await customerService.getAll(q);
      setCustomers(res.data.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setEditCustomer(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => { setEditCustomer(c); setForm({ name: c.name, address: c.address, pan: c.pan, mobile: c.mobile, notes: c.notes }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Customer name is required');
    setSaving(true);
    try {
      if (editCustomer) {
        await customerService.update(editCustomer._id, form);
        toast.success('Customer updated!');
      } else {
        await customerService.create(form);
        toast.success('Customer added!');
      }
      setShowModal(false);
      fetchCustomers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customerService.delete(id);
      toast.success('Customer deleted');
      setDeleteId(null);
      fetchCustomers(search);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  if (loading) return <MainLayout><PageLoader /></MainLayout>;

  return (
    <MainLayout>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{customers.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="form-input pl-11"
          placeholder="Search by name, mobile, or PAN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List */}
      {customers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary-500">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">No customers yet</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Add your first customer to get started</p>
          <button onClick={openAdd} className="btn-primary mx-auto">Add First Customer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map(c => (
            <div key={c._id} className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/customers/${c._id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{c.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{c.mobile || 'No mobile'}</p>
                  </div>
                </div>
                {c.address && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 truncate">{c.address}</p>
                )}
                {c.pan && (
                  <p className="text-xs font-mono text-gray-600 dark:text-slate-300 mb-3">PAN: {c.pan}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-lg font-medium">
                    {c.nextBillNumber - 1} invoices
                  </span>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Earnings</p>
                      <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatCurrency(c.totalEarnings || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Pending</p>
                      <p className={`text-sm font-extrabold mt-0.5 ${c.totalPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>
                        {formatCurrency(c.totalPending || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => navigate(`/invoices/create?customerId=${c._id}`)}
                  className="flex-1 text-xs btn-primary py-2"
                >
                  New Invoice
                </button>
                <button onClick={() => openEdit(c)} className="btn-secondary p-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button onClick={() => setDeleteId(c._id)} className="btn-danger p-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCustomer ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Customer Name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Mr. Nishith Shah" />
          </div>
          <div>
            <label className="form-label">Address</label>
            <textarea className="form-input" rows={2} value={form.address} onChange={set('address')} placeholder="Customer address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">PAN Number</label>
              <input className="form-input uppercase" value={form.pan} onChange={set('pan')} placeholder="ABCDE1234F" maxLength={10} />
            </div>
            <div>
              <label className="form-label">Mobile</label>
              <input className="form-input" type="tel" value={form.mobile} onChange={set('mobile')} placeholder="9876543210" />
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Any additional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editCustomer ? 'Update' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Customer">
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          This will permanently delete the customer and <strong>all their invoices</strong>. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1 bg-red-600 hover:bg-red-700 text-white">
            Delete
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
}
