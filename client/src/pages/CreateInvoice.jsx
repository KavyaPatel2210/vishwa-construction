import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { PageLoader } from '../components/common/LoadingSpinner';
import InvoicePreview from '../components/invoice/InvoicePreview';
import Modal from '../components/common/Modal';
import { customerService } from '../services/customerService';
import { invoiceService } from '../services/invoiceService';
import { useAuth } from '../context/AuthContext';
import { amountToWords, formatCurrency } from '../utils/amountToWords';
import { todayInputValue } from '../utils/dateFormatter';
import { generatePDF, printInvoice } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

const EMPTY_ITEM = { description: '', amount: '' };

export default function CreateInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [form, setForm] = useState({
    customerId: preselectedCustomerId || '',
    date: todayInputValue(),
    dueDate: '',
    items: [{ ...EMPTY_ITEM }],
    status: 'Pending',
    notes: '',
    categoryOfService: user?.categoryOfService || 'Civil Construction Work',
    gstEnabled: user?.gstEnabled || false,
    gstPercent: 18
  });

  const [nextBillNumber, setNextBillNumber] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    customerService.getAll()
      .then(res => {
        setCustomers(res.data.data);
        if (preselectedCustomerId) {
          const c = res.data.data.find(x => x._id === preselectedCustomerId);
          if (c) setSelectedCustomer(c);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!form.customerId) { setNextBillNumber(null); setSelectedCustomer(null); return; }
    customerService.getNextBillNumber(form.customerId)
      .then(res => setNextBillNumber(res.data.nextBillNumber));
    const c = customers.find(x => x._id === form.customerId);
    if (c) setSelectedCustomer(c);
  }, [form.customerId, customers]);

  const setField = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const setItem = (idx, field) => (e) => {
    setForm(p => {
      const items = [...p.items];
      items[idx] = { ...items[idx], [field]: e.target.value };
      return { ...p, items };
    });
  };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const totalAmount = form.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const gstAmt = form.gstEnabled ? (totalAmount * form.gstPercent) / 100 : 0;
  const grandTotal = totalAmount + gstAmt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) return toast.error('Please select a customer');
    if (form.items.some(i => !i.description.trim())) return toast.error('All work descriptions are required');
    if (form.items.some(i => !i.amount || isNaN(i.amount))) return toast.error('All amounts must be valid numbers');

    setSaving(true);
    try {
      const res = await invoiceService.create({
        ...form,
        items: form.items.map(i => ({ description: i.description, amount: parseFloat(i.amount) }))
      });
      setSavedInvoice(res.data.data);
      setShowPreview(true);
      toast.success('Invoice created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!savedInvoice) return;
    setGeneratingPDF(true);
    try {
      await generatePDF('invoice-preview', `Invoice-${savedInvoice.customerName}-Bill${savedInvoice.billNumber}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF generation failed'); }
    finally { setGeneratingPDF(false); }
  };

  if (loading) return <MainLayout><PageLoader /></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-primary-600 mb-5 text-sm font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        <h2 className="page-title mb-6">Create New Invoice</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Selection */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Select Customer *</label>
                <select
                  className="form-input"
                  value={form.customerId}
                  onChange={setField('customerId')}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <>
                  <div>
                    <label className="form-label">Bill Number</label>
                    <div className="form-input bg-gray-50 dark:bg-slate-600 text-gray-600 dark:text-slate-300 font-mono font-bold">
                      #{nextBillNumber || '...'}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Customer Address</label>
                    <div className="form-input bg-gray-50 dark:bg-slate-600 text-gray-600 dark:text-slate-300 text-sm">
                      {selectedCustomer.address || 'No address'}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="form-label">Invoice Date *</label>
                <input type="date" className="form-input" value={form.date} onChange={setField('date')} />
              </div>
              <div>
                <label className="form-label">Due Date (optional)</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={setField('dueDate')} />
              </div>
            </div>
          </div>

          {/* Work Items */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Work Description</h3>
              <button type="button" onClick={addItem} className="btn-secondary text-sm py-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Row
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs flex-shrink-0 mt-3">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      className="form-input text-sm"
                      rows={2}
                      placeholder="Work description (e.g., Total bungalow civil work finished.)"
                      value={item.description}
                      onChange={setItem(idx, 'description')}
                    />
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                      <input
                        type="number"
                        className="form-input pl-7 text-sm"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={setItem(idx, 'amount')}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="btn-danger p-2 mt-1 flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700">
              {/* GST Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={form.gstEnabled}
                      onChange={e => setForm(p => ({ ...p, gstEnabled: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Include GST</span>
                </div>
                {form.gstEnabled && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="form-input w-20 text-sm"
                      value={form.gstPercent}
                      onChange={e => setForm(p => ({ ...p, gstPercent: parseFloat(e.target.value) || 0 }))}
                      min="0" max="100"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                </div>
                {form.gstEnabled && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">GST ({form.gstPercent}%)</span>
                    <span className="font-semibold">{formatCurrency(gstAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-600">
                  <span>Total Amount</span>
                  <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {grandTotal > 0 && (
                <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-sm text-primary-800 dark:text-primary-300 italic">
                  {amountToWords(grandTotal)}
                </div>
              )}
            </div>
          </div>

          {/* Extra Details */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Category of Service</label>
                <input className="form-input" value={form.categoryOfService} onChange={setField('categoryOfService')} placeholder="Civil Construction Work" />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={setField('status')}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-input" rows={2} value={form.notes} onChange={setField('notes')} placeholder="Any additional notes for this invoice..." />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-4 text-base font-bold"
          >
            {saving ? 'Creating Invoice...' : 'Create Invoice & Preview'}
          </button>
        </form>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => { setShowPreview(false); navigate('/invoices'); }} size="xl" title="Invoice Created!">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="btn-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {generatingPDF ? 'Generating...' : 'Download PDF'}
          </button>
          <button onClick={() => printInvoice('invoice-preview')} className="btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print
          </button>
          <button onClick={() => { setShowPreview(false); navigate('/invoices'); }} className="btn-secondary">
            View All Invoices
          </button>
        </div>
        <div className="overflow-auto max-h-[70vh] border border-gray-200 rounded-xl">
          {savedInvoice && (
            <InvoicePreview
              invoice={savedInvoice}
              contractor={user}
            />
          )}
        </div>
      </Modal>
    </MainLayout>
  );
}
