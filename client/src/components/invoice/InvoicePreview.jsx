import { formatDate } from '../../utils/dateFormatter';

export default function InvoicePreview({ invoice, contractor }) {
  if (!invoice || !contractor) return null;

  const {
    billNumber, date, customerName, customerAddress, customerPan,
    items = [], totalAmount, grandTotal, amountInWords,
    gstEnabled, gstPercent, gstAmount, categoryOfService, notes
  } = invoice;

  const displayTotal = gstEnabled ? grandTotal : totalAmount;

  return (
    <div
      id="invoice-preview"
      className="invoice-font bg-white"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 18mm',
        margin: '0 auto',
        fontSize: '12pt',
        color: '#000',
        lineHeight: '1.5',
        fontFamily: '"Times New Roman", Times, serif'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        {contractor.logo && (
          <img
            src={contractor.logo}
            alt="Company Logo"
            style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain', margin: '0 auto 8px auto', display: 'block' }}
          />
        )}
        <div style={{ fontSize: '18pt', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '2px' }}>
          {contractor.companyName || 'VISHWA CONSTRUCTION'}
        </div>
        <div style={{ fontSize: '11pt' }}>
          Prop. {contractor.contractorName || 'Rashminkumar R Patel'}
        </div>
        <div style={{ fontSize: '11pt' }}>
          PAN NO.({contractor.pan || 'BMVPP3612B'})
        </div>
        <div style={{ fontSize: '10pt', marginTop: '2px' }}>
          {contractor.address || 'A-19, Avdhoot Nagar Society-1, Bholav, Bharuch-392001'}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '2px solid #000', margin: '10px 0' }} />

      {/* Invoice Title */}
      <div style={{ textAlign: 'center', fontSize: '15pt', fontWeight: 'bold', marginBottom: '14px', textDecoration: 'underline' }}>
        INVOICE
      </div>

      {/* Bill No and Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div><strong>Bill No.: {billNumber}</strong></div>
        <div><strong>Date: {formatDate(date)}</strong></div>
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '14px' }}>
        <div><strong>Name:</strong> {customerName}</div>
        {customerAddress && (
          <div style={{ paddingLeft: '40px', whiteSpace: 'pre-line' }}>{customerAddress}</div>
        )}
        {customerPan && (
          <div><strong>PAN NO. :-</strong> {customerPan}</div>
        )}
      </div>

      {/* Work Items Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '0',
        border: '1px solid #000'
      }}>
        <thead>
          <tr>
            <th style={{
              border: '1px solid #000',
              padding: '8px 12px',
              textAlign: 'center',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
              width: '75%',
              fontSize: '12pt'
            }}>
              Description
            </th>
            <th style={{
              border: '1px solid #000',
              padding: '8px 12px',
              textAlign: 'right',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
              width: '25%',
              textDecoration: 'underline',
              fontSize: '12pt'
            }}>
              Amount(Rs.)
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Each work item in its own dedicated table row — fixes new-line issue in PDF */}
          {items.map((item, idx) => (
            <tr key={`item-${idx}`}>
              <td style={{
                border: '1px solid #000',
                padding: '8px 12px',
                verticalAlign: 'top'
              }}>
                {/* Use block-level div (NOT ol/li) so html2canvas renders each on its own line */}
                <div style={{
                  display: 'block',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.7',
                  margin: 0,
                  padding: 0
                }}>
                  {idx + 1}.{'  '}{item.description}
                </div>
              </td>
              <td style={{
                border: '1px solid #000',
                padding: '8px 12px',
                textAlign: 'right',
                verticalAlign: 'top',
                whiteSpace: 'nowrap'
              }}>
                {item.amount
                  ? parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                  : ''}
              </td>
            </tr>
          ))}

          {/* Empty filler rows — always show minimum 5 rows total */}
          {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={{ border: '1px solid #000', padding: '8px 12px', height: '32px' }}>&nbsp;</td>
              <td style={{ border: '1px solid #000', padding: '8px 12px' }}>&nbsp;</td>
            </tr>
          ))}

          {/* GST row if enabled */}
          {gstEnabled && (
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px 12px', textAlign: 'right', fontWeight: 'bold' }}>
                GST ({gstPercent}%)
              </td>
              <td style={{ border: '1px solid #000', padding: '8px 12px', textAlign: 'right' }}>
                {(gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          )}

          {/* Total Row */}
          <tr>
            <td style={{
              border: '1px solid #000',
              padding: '10px 12px',
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '12pt'
            }}>
              Total Amount
            </td>
            <td style={{
              border: '1px solid #000',
              padding: '10px 12px',
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '12pt'
            }}>
              {(displayTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>

          {/* Amount in Words */}
          <tr>
            <td colSpan={2} style={{
              border: '1px solid #000',
              padding: '8px 12px',
              fontSize: '11pt',
              fontStyle: 'italic'
            }}>
              <strong>Amount In Words :</strong> {amountInWords}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes */}
      {notes && (
        <div style={{ marginTop: '10px', fontSize: '10pt', fontStyle: 'italic' }}>
          <strong>Notes:</strong> {notes}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '11pt' }}>
        <div>{categoryOfService || 'Category of service'}</div>
        <div>For, {contractor.companyName || 'Vishwa Construction'}</div>
      </div>

      {/* Signature */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '50px' }}>
        <div style={{ textAlign: 'center', minWidth: '200px' }}>
          {contractor.signature && (
            <div style={{
              marginBottom: '6px',
              border: '1px solid #000',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80px'
            }}>
              <img
                src={contractor.signature}
                alt="Signature"
                style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }}
              />
            </div>
          )}
          <div>({contractor.contractorName || 'Rashminkumar R Patel'})</div>
          <div>(Authorized signatory)</div>
        </div>
      </div>
    </div>
  );
}
