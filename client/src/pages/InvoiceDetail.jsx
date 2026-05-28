import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import InvoicePreview from '../components/invoice/InvoicePreview';
import { PageLoader } from '../components/common/LoadingSpinner';
import { invoiceService } from '../services/invoiceService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import { formatCurrency } from '../utils/amountToWords';
import { generatePDF, printInvoice, shareInvoicePDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    invoiceService.getById(id)
      .then(res => setInvoice(res.data.data))
      .catch(() => { toast.error('Invoice not found'); navigate('/invoices'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setGeneratingPDF(true);
    try {
      await generatePDF('invoice-preview', `Invoice-${invoice.customerName}-Bill${invoice.billNumber}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to generate PDF'); }
    finally { setGeneratingPDF(false); }
  };

  const handleStatusToggle = async () => {
    const newStatus = invoice.status === 'Paid' ? 'Pending' : 'Paid';
    try {
      await invoiceService.update(id, { status: newStatus });
      setInvoice(prev => ({ ...prev, status: newStatus }));
      toast.success(`Marked as ${newStatus}`);
    } catch { toast.error('Update failed'); }
  };

  const handleDuplicate = async () => {
    try {
      const res = await invoiceService.duplicate(id);
      toast.success('Invoice duplicated!');
      navigate(`/invoices/${res.data.data._id}`);
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    try {
      await invoiceService.delete(id);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <MainLayout><PageLoader /></MainLayout>;
  if (!invoice) return null;

  return (
    <MainLayout>
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-primary-600 text-sm font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        <div className="flex gap-2 flex-wrap">
          {/* ✏️ Edit Invoice — primary action */}
          {invoice.status !== 'Paid' && (
            <button
              onClick={() => navigate(`/invoices/${id}/edit`)}
              className="btn-primary text-sm py-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Invoice
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={generatingPDF}
            className="btn-secondary text-sm py-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {generatingPDF ? 'Generating...' : 'Download PDF'}
          </button>

          <button onClick={() => printInvoice('invoice-preview')} className="btn-secondary text-sm py-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print
          </button>

          <button
            onClick={async () => {
              setSharing(true);
              try {
                const result = await shareInvoicePDF('invoice-preview', { ...invoice, companyName: user?.companyName });
                if (result.fallback) toast.success('PDF downloaded! Share it manually on WhatsApp.');
                else if (result.success) toast.success('Invoice shared!');
              } catch { toast.error('Failed to share PDF'); }
              finally { setSharing(false); }
            }}
            disabled={sharing}
            className="btn-success text-sm py-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            {sharing ? 'Preparing...' : 'Share PDF'}
          </button>

          <button onClick={handleDuplicate} className="btn-secondary text-sm py-2">Duplicate</button>

          <button
            onClick={handleStatusToggle}
            className={`text-sm py-2 px-4 rounded-xl font-semibold transition-colors ${
              invoice.status === 'Paid'
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            {invoice.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
          </button>

          <button onClick={handleDelete} className="btn-danger text-sm py-2">Delete</button>
        </div>
      </div>

      {/* Invoice Info Bar */}
      <div className="card p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <span className="text-primary-700 dark:text-primary-400 font-bold text-sm">#{invoice.billNumber}</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{invoice.customerName}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{formatDate(invoice.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={invoice.status === 'Paid' ? 'badge-paid' : 'badge-pending'}>{invoice.status}</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(invoice.grandTotal || invoice.totalAmount)}</span>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="overflow-auto rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 bg-gray-100">
        <InvoicePreview invoice={invoice} contractor={user} />
      </div>
    </MainLayout>
  );
}
