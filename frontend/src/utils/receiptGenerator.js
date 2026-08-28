/**
 * Receipt Generator Utility
 * Generates printable receipt for bill closure
 */

/**
 * Generate receipt HTML for printing
 * @param {Object} receiptData - Receipt data from API
 * @returns {string} HTML string for receipt
 */
export const generateReceiptHTML = (receiptData) => {
  const {
    bill_number,
    customer_name,
    customer_phone,
    customer_address,
    principal_amount,
    interest_percentage,
    interest_months,
    calculated_interest,
    total_payable,
    amount_paid,
    payment_method,
    reference_number,
    closed_at,
    items
  } = receiptData;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const paymentMethodLabels = {
    cash: 'Cash',
    card: 'Card',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${bill_number}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .receipt-header h1 {
          margin: 0;
          font-size: 24px;
        }
        .receipt-header h2 {
          margin: 5px 0;
          font-size: 18px;
          color: #666;
        }
        .receipt-section {
          margin-bottom: 20px;
        }
        .receipt-section h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .receipt-label {
          font-weight: bold;
        }
        .receipt-value {
          text-align: right;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }
        .items-table th {
          background: #f5f5f5;
        }
        .total-section {
          border-top: 2px solid #000;
          padding-top: 15px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .receipt-footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          font-size: 12px;
          color: #666;
        }
        .signature-section {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 45%;
          border-top: 1px solid #000;
          padding-top: 10px;
          text-align: center;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-header">
        <h1>PAWN BROKER MANAGEMENT SYSTEM</h1>
        <h2>BILL CLOSURE RECEIPT</h2>
      </div>

      <div class="receipt-section">
        <h3>Bill Information</h3>
        <div class="receipt-row">
          <span class="receipt-label">Bill Number:</span>
          <span class="receipt-value">${bill_number}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Closure Date:</span>
          <span class="receipt-value">${formatDate(closed_at)}</span>
        </div>
      </div>

      <div class="receipt-section">
        <h3>Customer Information</h3>
        <div class="receipt-row">
          <span class="receipt-label">Customer Name:</span>
          <span class="receipt-value">${customer_name}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Phone:</span>
          <span class="receipt-value">${customer_phone || 'N/A'}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Address:</span>
          <span class="receipt-value">${customer_address || 'N/A'}</span>
        </div>
      </div>

      <div class="receipt-section">
        <h3>Pledged Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Description</th>
              <th>Weight (g)</th>
              <th>Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.item_type}</td>
                <td>${item.item_description}</td>
                <td>${item.weight || '-'}</td>
                <td>${formatCurrency(item.current_market_value)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="receipt-section">
        <h3>Payment Details</h3>
        <div class="receipt-row">
          <span class="receipt-label">Principal Amount:</span>
          <span class="receipt-value">${formatCurrency(principal_amount)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Interest Rate:</span>
          <span class="receipt-value">${interest_percentage}%</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Interest Period:</span>
          <span class="receipt-value">${interest_months} month(s)</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Calculated Interest:</span>
          <span class="receipt-value">${formatCurrency(calculated_interest)}</span>
        </div>
      </div>

      <div class="total-section">
        <div class="total-row">
          <span class="receipt-label">Total Payable:</span>
          <span class="receipt-value">${formatCurrency(total_payable)}</span>
        </div>
        <div class="total-row">
          <span class="receipt-label">Amount Paid:</span>
          <span class="receipt-value">${formatCurrency(amount_paid)}</span>
        </div>
      </div>

      <div class="receipt-section">
        <h3>Payment Method</h3>
        <div class="receipt-row">
          <span class="receipt-label">Method:</span>
          <span class="receipt-value">${paymentMethodLabels[payment_method] || payment_method}</span>
        </div>
        ${reference_number ? `
          <div class="receipt-row">
            <span class="receipt-label">Reference Number:</span>
            <span class="receipt-value">${reference_number}</span>
          </div>
        ` : ''}
      </div>

      <div class="signature-section">
        <div class="signature-box">
          Customer Signature
        </div>
        <div class="signature-box">
          Authorized Signature
        </div>
      </div>

      <div class="receipt-footer">
        <p>This is a computer-generated receipt.</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Print receipt
 * @param {Object} receiptData - Receipt data from API
 */
export const printReceipt = (receiptData) => {
  const receiptHTML = generateReceiptHTML(receiptData);
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.print();
  };
};

/**
 * Download receipt as PDF (requires jsPDF library)
 * @param {Object} receiptData - Receipt data from API
 */
export const downloadReceiptPDF = (receiptData) => {
  // This function requires jsPDF library
  // For now, we'll use the print function
  console.warn('PDF download requires jsPDF library. Using print instead.');
  printReceipt(receiptData);
};

export default {
  generateReceiptHTML,
  printReceipt,
  downloadReceiptPDF
};
