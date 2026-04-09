import { BillDetails, VAT_RATE, printBill } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";

interface BillDisplayProps {
  bill: BillDetails;
  showActions?: boolean;
}

export default function BillDisplay({ bill, showActions = true }: BillDisplayProps) {
  const handlePrint = () => {
    printBill(bill);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateBillJSON(bill)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `bill-${bill.billNo}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              🌿 {bill.restaurantName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{bill.restaurantAddress}</p>
            <p className="text-sm text-muted-foreground">PAN: {bill.restaurantPan}</p>
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bill Header Info */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <p className="text-xs text-muted-foreground">Bill No</p>
            <p className="font-bold text-lg">{bill.billNo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date & Time</p>
            <p className="font-medium">{bill.date} {bill.time}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-secondary rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium">Customer Information</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{bill.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{bill.customerPhone}</p>
            </div>
            {bill.tableNumber && (
              <div>
                <p className="text-muted-foreground">Table No</p>
                <p className="font-medium">Table {bill.tableNumber}</p>
              </div>
            )}
            {bill.customerPan && (
              <div>
                <p className="text-muted-foreground">PAN</p>
                <p className="font-medium">{bill.customerPan}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Bill Items</p>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-2 bg-secondary p-3 font-medium text-sm">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
            {bill.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 p-3 border-t text-sm"
              >
                <div className="col-span-5">{item.name}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">Rs.{item.unitPrice.toFixed(2)}</div>
                <div className="col-span-3 text-right font-medium">
                  Rs.{(item.quantity * item.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount Summary */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs.{bill.subtotal.toFixed(2)}</span>
          </div>

          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Discount ({bill.discountPercent}%)
              </span>
              <span className="text-red-600">-Rs.{bill.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded">
            <span className="font-medium">Taxable Amount</span>
            <span className="font-medium">Rs.{bill.taxableAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              VAT ({(VAT_RATE * 100).toFixed(0)}%)
            </span>
            <span>Rs.{bill.vatAmount.toFixed(2)}</span>
          </div>

          {bill.deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Charge</span>
              <span>Rs.{bill.deliveryFee.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total Amount</span>
            <span className="text-primary">Rs.{bill.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium uppercase">{bill.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-green-600">Completed</span>
          </div>
        </div>

        {/* Tax Compliance Footer */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs text-center text-muted-foreground space-y-1">
          <p className="font-bold">TAX COMPLIANCE INFORMATION</p>
          <p>This bill is VAT-compliant as per IRD regulations</p>
          <p>Bill No: {bill.billNo}</p>
          <p>This is an electronically generated bill</p>
        </div>
      </CardContent>
    </Card>
  );
}

function generateBillJSON(bill: BillDetails): string {
  return JSON.stringify(bill, null, 2);
}
