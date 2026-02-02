// VAT/PAN Compliant Billing System for Nepal (IRD Compliance)

export interface BillItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  taxable?: boolean;
}

export interface BillDetails {
  billNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerPan?: string;
  tableNumber?: number; // For dine-in orders
  restaurantName: string;
  restaurantPan: string;
  restaurantAddress: string;
  restaurantPhone: string;
  items: BillItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxableAmount: number;
  vatAmount: number;
  vatPercent: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  orderNotes?: string;
}

// Default restaurant details (should come from Settings)
export const DEFAULT_RESTAURANT = {
  name: "Delicious Bites Restaurant",
  pan: "123456789", // PAN number
  address: "Kathmandu, Nepal",
  phone: "01-4123456",
};

// VAT Rate for Nepal (typically 13%)
export const VAT_RATE = 0.13;

export function generateBillNo(): string {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.random().toString().slice(2, 5);
  return `BILL-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}${timestamp}${random}`;
}

export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-NP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-NP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function calculateBillAmounts(
  items: BillItem[],
  discountPercent: number = 0,
  deliveryFee: number = 0
) {
  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Apply discount
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const afterDiscount = subtotal - discountAmount;

  // Taxable amount (items with tax)
  const taxableItems = items.filter((item) => item.taxable !== false);
  const taxableAmount = taxableItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Apply discount to taxable amount
  const taxableAfterDiscount =
    taxableAmount - (taxableAmount * discountPercent) / 100;

  // Calculate VAT
  const vatAmount = Math.round(taxableAfterDiscount * VAT_RATE);

  // Total amount
  const totalAmount = Math.round(
    afterDiscount + vatAmount + deliveryFee
  );

  return {
    subtotal: Math.round(subtotal),
    discountAmount: Math.round(discountAmount),
    discountPercent,
    taxableAmount: Math.round(taxableAfterDiscount),
    vatAmount,
    deliveryFee: Math.round(deliveryFee),
    totalAmount,
  };
}

export function generateBill(
  items: BillItem[],
  customerName: string,
  customerPhone: string,
  paymentMethod: string,
  discountPercent: number = 0,
  deliveryFee: number = 0,
  customerPan?: string,
  restaurantDetails = DEFAULT_RESTAURANT,
  tableNumber?: number
): BillDetails {
  const amounts = calculateBillAmounts(items, discountPercent, deliveryFee);

  return {
    billNo: generateBillNo(),
    date: formatDate(),
    time: formatTime(),
    customerName,
    customerPhone,
    customerPan,
    tableNumber,
    restaurantName: restaurantDetails.name,
    restaurantPan: restaurantDetails.pan,
    restaurantAddress: restaurantDetails.address,
    restaurantPhone: restaurantDetails.phone,
    items,
    ...amounts,
    paymentMethod,
  };
}

export function saveBill(bill: BillDetails): void {
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    ...bill,
    savedAt: new Date().toISOString(),
  });
  localStorage.setItem("bills", JSON.stringify(bills));
}

export function getBills(): BillDetails[] {
  return JSON.parse(localStorage.getItem("bills") || "[]");
}

export function getBillByNo(billNo: string): BillDetails | null {
  const bills = getBills();
  return bills.find((bill: BillDetails) => bill.billNo === billNo) || null;
}

// Generate Bill HTML for printing
export function generateBillHTML(bill: BillDetails): string {
  const itemsHTML = bill.items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
      <td style="text-align: right;">₹${(item.quantity * item.unitPrice).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Bill - ${bill.billNo}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          max-width: 80mm;
          margin: 0;
          padding: 10px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
        }
        .bill-no {
          text-align: center;
          font-weight: bold;
          margin: 10px 0;
          border: 1px solid #000;
          padding: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th {
          text-align: left;
          border-bottom: 1px solid #000;
          padding: 5px 0;
          font-weight: bold;
        }
        td {
          padding: 5px 0;
        }
        .amount-section {
          margin: 10px 0;
          padding-top: 10px;
          border-top: 1px solid #000;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .amount-row.total {
          font-weight: bold;
          border-top: 1px solid #000;
          padding-top: 5px;
          font-size: 16px;
        }
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #000;
          font-size: 12px;
        }
        .compliance {
          font-size: 10px;
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          border: 1px solid #ccc;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="restaurant-name">${bill.restaurantName}</div>
        <div>${bill.restaurantAddress}</div>
        <div>PAN: ${bill.restaurantPan}</div>
        <div>Ph: ${bill.restaurantPhone}</div>
      </div>

      <div class="bill-no">
        Bill No: ${bill.billNo}<br>
        Date: ${bill.date} ${bill.time}
      </div>

      <div>
        <div><strong>Customer:</strong> ${bill.customerName}</div>
        <div><strong>Phone:</strong> ${bill.customerPhone}</div>
        ${bill.customerPan ? `<div><strong>PAN:</strong> ${bill.customerPan}</div>` : ""}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="amount-section">
        <div class="amount-row">
          <span>Subtotal:</span>
          <span>₹${bill.subtotal.toFixed(2)}</span>
        </div>
        ${bill.discountAmount > 0 ? `
        <div class="amount-row">
          <span>Discount (${bill.discountPercent}%):</span>
          <span>-₹${bill.discountAmount.toFixed(2)}</span>
        </div>
        ` : ""}
        <div class="amount-row">
          <span>Taxable Amount:</span>
          <span>₹${bill.taxableAmount.toFixed(2)}</span>
        </div>
        <div class="amount-row">
          <span>VAT (${(VAT_RATE * 100).toFixed(0)}%):</span>
          <span>₹${bill.vatAmount.toFixed(2)}</span>
        </div>
        ${bill.deliveryFee > 0 ? `
        <div class="amount-row">
          <span>Delivery Charge:</span>
          <span>₹${bill.deliveryFee.toFixed(2)}</span>
        </div>
        ` : ""}
        <div class="amount-row total">
          <span>Total Amount:</span>
          <span>₹${bill.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-row">
          <span><strong>Payment Method:</strong></span>
          <span>${bill.paymentMethod.toUpperCase()}</span>
        </div>
      </div>

      <div class="footer">
        <div>Thank you for your order!</div>
        <div>Please visit us again</div>
      </div>

      <div class="compliance">
        <strong>TAX COMPLIANCE INFORMATION</strong><br>
        This bill is VAT-compliant as per IRD regulations<br>
        Restaurant PAN: ${bill.restaurantPan}<br>
        Bill Date: ${bill.date} | Bill Time: ${bill.time}<br>
        This is an electronically generated bill
      </div>
    </body>
    </html>
  `;
}

export function printBill(bill: BillDetails): void {
  const html = generateBillHTML(bill);
  const printWindow = window.open("", "", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
