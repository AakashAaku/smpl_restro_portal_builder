import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Download, Printer, QrCode } from "lucide-react";

interface Table {
  id: number;
  number: string;
  capacity: number;
}

const TABLES: Table[] = [
  { id: 1, number: "A1", capacity: 2 },
  { id: 2, number: "A2", capacity: 4 },
  { id: 3, number: "A3", capacity: 4 },
  { id: 4, number: "A4", capacity: 6 },
  { id: 5, number: "B1", capacity: 2 },
  { id: 6, number: "B2", capacity: 4 },
  { id: 7, number: "B3", capacity: 6 },
  { id: 8, number: "B4", capacity: 8 },
];

function generateQRCodeDataURL(tableNumber: string): string {
  // Generate a simple QR code URL using QR server API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${window.location.origin}/table-order?table=${tableNumber}`
  )}`;
  return qrUrl;
}

export default function TableQRCodes() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const handlePrintQRCode = (tableNumber: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrDataUrl = generateQRCodeDataURL(tableNumber);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${tableNumber} QR Code</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
              background: white;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 3px solid #333;
            }
            h1 {
              margin: 0 0 20px 0;
              font-size: 32px;
            }
            img {
              border: 2px solid #333;
              padding: 10px;
              background: white;
            }
            p {
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Table ${tableNumber}</h1>
            <img src="${qrDataUrl}" alt="Table ${tableNumber} QR Code" />
            <p>Scan to order</p>
          </div>
          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadQRCode = (tableNumber: string) => {
    const qrDataUrl = generateQRCodeDataURL(tableNumber);
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `table-${tableNumber}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintAllQRCodes = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Table QR Codes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .page {
              page-break-after: always;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 40px;
              padding: 20px;
              height: 100vh;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #333;
              padding: 20px;
            }
            h2 {
              margin: 0 0 15px 0;
              font-size: 24px;
            }
            img {
              width: 250px;
              height: 250px;
              border: 1px solid #999;
              padding: 5px;
            }
            p {
              margin: 10px 0 0 0;
              font-weight: bold;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="page">
    `;

    TABLES.forEach((table, index) => {
      const qrDataUrl = generateQRCodeDataURL(table.number);
      htmlContent += `
        <div class="qr-container">
          <h2>Table ${table.number}</h2>
          <img src="${qrDataUrl}" alt="Table ${table.number} QR Code" />
          <p>Capacity: ${table.capacity}</p>
        </div>
      `;

      if ((index + 1) % 4 === 0 && index + 1 < TABLES.length) {
        htmlContent += `
          </div>
          <div class="page">
        `;
      }
    });

    htmlContent += `
          </div>
          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table QR Codes</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage QR codes for table ordering
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handlePrintAllQRCodes}
            className="gap-2"
            size="lg"
          >
            <Printer className="h-4 w-4" />
            Print All QR Codes
          </Button>
        </div>

        {/* QR Code Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TABLES.map((table) => {
            const qrDataUrl = generateQRCodeDataURL(table.number);
            return (
              <Card
                key={table.id}
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => setSelectedTable(table.number)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-xl">
                    Table {table.number}
                  </CardTitle>
                  <p className="text-center text-sm text-muted-foreground">
                    Capacity: {table.capacity}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-3 rounded border border-gray-200 flex justify-center">
                    <img
                      src={qrDataUrl}
                      alt={`Table ${table.number} QR Code`}
                      className="h-48 w-48 object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintQRCode(table.number);
                      }}
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadQRCode(table.number);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `/table-order?table=${table.number}`,
                        "_blank"
                      );
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                    Test Scan
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
    </div>
  );
}
