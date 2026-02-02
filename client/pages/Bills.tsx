import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBills, BillDetails } from "@/lib/billing";
import BillDisplay from "@/components/billing/BillDisplay";
import {
  FileText,
  Download,
  Printer,
  Search,
  Eye,
  X,
  TrendingUp,
  DollarSign,
  Receipt,
} from "lucide-react";

export default function Bills() {
  const [bills, setBills] = useState<BillDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<BillDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all");

  useEffect(() => {
    const savedBills = getBills();
    setBills(savedBills);
  }, []);

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerPhone.includes(searchTerm);

    return matchesSearch;
  });

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalVAT = bills.reduce((sum, bill) => sum + bill.vatAmount, 0);
  const totalTaxableAmount = bills.reduce((sum, bill) => sum + bill.taxableAmount, 0);

  const handleDownload = (bill: BillDetails) => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(bill, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `bill-${bill.billNo}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Bills & Invoices</h1>
            <p className="text-muted-foreground mt-1">
              Manage all customer bills and invoices with VAT compliance
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bills</p>
                  <p className="text-3xl font-bold">{bills.length}</p>
                </div>
                <Receipt className="h-10 w-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{(totalRevenue / 100000).toFixed(2)}L</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total VAT Collected</p>
                  <p className="text-3xl font-bold">₹{(totalVAT / 1000).toFixed(1)}K</p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bills" className="w-full">
          <TabsList>
            <TabsTrigger value="bills">All Bills</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Tax Compliance</TabsTrigger>
          </TabsList>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-4">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by bill number, customer name, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bills List */}
            {filteredBills.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No bills found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredBills.map((bill) => (
                  <Card key={bill.billNo} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="bg-secondary rounded-lg p-3">
                              <Receipt className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold">{bill.billNo}</p>
                              <p className="text-sm text-muted-foreground">
                                {bill.customerName} • {bill.customerPhone}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right min-w-[150px]">
                          <p className="font-bold text-lg">₹{bill.totalAmount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBill(bill)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(bill)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-bold">₹{totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Bill Value</span>
                      <span className="font-bold">
                        ₹{bills.length > 0 ? (totalRevenue / bills.length).toFixed(2) : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Highest Bill</span>
                      <span className="font-bold">
                        ₹{Math.max(...bills.map((b) => b.totalAmount), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lowest Bill</span>
                      <span className="font-bold">
                        ₹{bills.length > 0 ? Math.min(...bills.map((b) => b.totalAmount)).toFixed(2) : "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(
                      bills.reduce(
                        (acc, bill) => {
                          const existing = acc.get(bill.paymentMethod) || 0;
                          return acc.set(bill.paymentMethod, existing + 1);
                        },
                        new Map<string, number>()
                      )
                    ).map(([method, count]) => (
                      <div key={method} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{method}</span>
                        <span className="font-bold">{count} bills</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tax Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Taxable Amount</span>
                    <span className="font-bold">₹{totalTaxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total VAT (13%)</span>
                    <span className="font-bold text-green-600">₹{totalVAT.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total with VAT</span>
                    <span>₹{(totalTaxableAmount + totalVAT).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>VAT Compliance Report</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Tax compliance information for IRD submission
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Total Bills Generated</p>
                    <p className="text-3xl font-bold">{bills.length}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Total Taxable Amount</p>
                    <p className="text-3xl font-bold">₹{totalTaxableAmount.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">VAT Collected (13%)</p>
                    <p className="text-3xl font-bold">₹{totalVAT.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-bold">Bill Distribution by Month</p>
                  {Array.from(
                    bills.reduce(
                      (acc, bill) => {
                        const month = new Date(bill.date).toLocaleString("default", {
                          month: "short",
                          year: "numeric",
                        });
                        const existing = acc.get(month) || { count: 0, revenue: 0, vat: 0 };
                        return acc.set(month, {
                          count: existing.count + 1,
                          revenue: existing.revenue + bill.totalAmount,
                          vat: existing.vat + bill.vatAmount,
                        });
                      },
                      new Map()
                    )
                  ).map(([month, stats]) => (
                    <div
                      key={month}
                      className="flex justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{month}</p>
                        <p className="text-sm text-muted-foreground">{stats.count} bills</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{stats.revenue.toFixed(2)}</p>
                        <p className="text-sm text-green-600">VAT: ₹{stats.vat.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 space-y-2 border border-yellow-200 dark:border-yellow-800">
                  <p className="font-bold">IRD Compliance Checklist</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>All bills generated with unique bill numbers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>VAT (13%) calculated on all taxable items</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Customer information captured (name, phone, PAN)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Restaurant PAN included on all bills</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Date and time stamps recorded</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Bills can be exported for IRD submission</span>
                    </li>
                  </ul>
                </div>

                <Button variant="outline" className="w-full" size="lg">
                  Export All Bills for IRD Submission
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bill Detail Modal */}
        {selectedBill && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b p-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">Bill Details - {selectedBill.billNo}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBill(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <BillDisplay bill={selectedBill} showActions={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
