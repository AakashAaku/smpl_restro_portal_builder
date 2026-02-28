import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Download, Printer, QrCode, Loader2, Leaf, Sparkles, Scan, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTables } from "@/lib/tables-api";

function generateQRCodeDataURL(tableNumber: string): string {
  // Generate a simple QR code URL using QR server API
  // Using window.location.origin supports local network address (e.g., http://192.168.x.x:3000)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${window.location.origin}/table-order?table=${tableNumber}`
  )}`;
  return qrUrl;
}

export default function TableQRCodes() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

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

    tables.forEach((table, index) => {
      const qrDataUrl = generateQRCodeDataURL(table.number);
      htmlContent += `
        <div class="qr-container">
          <h2>Table ${table.number}</h2>
          <img src="${qrDataUrl}" alt="Table ${table.number} QR Code" />
          <p>Capacity: ${table.capacity}</p>
        </div>
      `;

      if ((index + 1) % 4 === 0 && index + 1 < tables.length) {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
              VenzoSmart • Digital Access
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Table <span className="text-primary italic">Portals</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Seamless Digital Integration for Organic Dining"
          </p>
        </div>
        <div className="bg-emerald-50/50 px-6 py-3 rounded-2xl border border-emerald-100/50 backdrop-blur-sm shadow-sm group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-3 w-3 text-emerald-600 group-hover:animate-pulse" />
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Network Node</p>
          </div>
          <p className="text-sm font-black text-emerald-900 font-mono tracking-tight">{window.location.origin}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handlePrintAllQRCodes}
          className="h-12 px-8 rounded-xl font-black border-none shadow-xl shadow-primary/20 gap-3 transition-all hover:scale-[1.02] bg-primary text-white"
          disabled={isLoading || tables.length === 0}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
          LAMINATE ALL ACCESS POINTS
        </Button>
      </div>

      {/* QR Code Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground italic text-lg">Generating table access points...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-xl border-2 border-dashed border-muted">
          <p className="text-muted-foreground mb-4">No tables found to generate codes for.</p>
          <Button variant="outline" onClick={() => window.location.href = '/admin/tables'}>Configure Tables First</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tables.map((table) => {
            const qrDataUrl = generateQRCodeDataURL(table.number);
            return (
              <Card
                key={table.id}
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border-2 hover:border-primary/50"
                onClick={() => setSelectedTable(table.number)}
              >
                <CardHeader className="pb-4 bg-emerald-50/30 border-b border-emerald-900/5 items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 italic">Venzosmart • Station</span>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter text-emerald-900">
                    {table.number}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 bg-white/50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm mt-1">
                    <Scan className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Capacity: {table.capacity}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="bg-white p-3 rounded border border-gray-200 flex justify-center shadow-inner">
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
                      <Printer className="h-3 w-3" />
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
                      <Download className="h-3 w-3" />
                      Save
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `/table-order?table=${table.number}`,
                        "_blank"
                      );
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                    Preview Ordering
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
