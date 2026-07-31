import React from "react";
import { AdminLayout, AdminCard, AdminStatCard } from "@/screens/admin/AdminLayout";
import { mockAdminFinancialReports, mockAdminPayments } from "@/lib/admin-mock-data";
import { adminFinancialApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Wallet, TrendingDown, FileBarChart, Download,
  Plus, CreditCard, Banknote, BanknoteIcon, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const reportTypeConfig: Record<string, { label: string; color: string }> = {
  income: { label: "Income", color: "text-success" },
  expenditure: { label: "Expenditure", color: "text-destructive" },
  audit: { label: "Audit", color: "text-royal" },
  dues: { label: "Dues", color: "text-gold" },
};

const reportStatusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-success/15 text-success border-success/30" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-success/15 text-success border-success/30" },
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const methodIcon: Record<string, React.ElementType> = {
  card: CreditCard,
  bank_transfer: Banknote,
  cash: BanknoteIcon,
};

export function AdminFinancialsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [addReportOpen, setAddReportOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("reports");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AdminLayout
      title="Financial Management"
      subtitle="Publish reports, manage payments, and track revenue"
      actions={
        <Dialog open={addReportOpen} onOpenChange={setAddReportOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-primary text-primary-foreground">
              <Plus className="size-4 mr-1.5" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Financial Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Report Title</label>
                <Input placeholder="Q3 2025 Income Report" className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Period</label>
                  <Input placeholder="Q3 2025" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Amount (₦)</label>
                  <Input type="number" placeholder="0" className="h-10 rounded-xl" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddReportOpen(false)}>Cancel</Button>
              <Button className="bg-primary text-primary-foreground" onClick={() => setAddReportOpen(false)}>Create Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Total Revenue" value="₦15.65M" icon={Wallet} trend="12.5%" trendUp color="text-success" bg="bg-success/10" />
        <AdminStatCard label="Outstanding Dues" value="₦3.45M" icon={TrendingDown} color="text-destructive" bg="bg-destructive/10" />
        <AdminStatCard label="Published Reports" value={mockAdminFinancialReports.filter((r) => r.status === "published").length} icon={FileBarChart} color="text-royal" bg="bg-royal/10" />
        <AdminStatCard label="Pending Payments" value={mockAdminPayments.filter((p) => p.status === "pending").length} icon={Clock} color="text-warning" bg="bg-warning/10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {mockAdminFinancialReports.map((report) => {
                const typeConf = reportTypeConfig[report.type];
                const statusConf = reportStatusConfig[report.status];
                return (
                  <AdminCard key={report.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", report.type === "income" ? "bg-success/10" : report.type === "expenditure" ? "bg-destructive/10" : "bg-royal/10")}>
                        <FileBarChart className={cn("size-5", typeConf.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-foreground">{report.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{report.period}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className={cn("text-sm font-semibold", typeConf.color)}>
                            ₦{report.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", statusConf.className)}>{statusConf.label}</Badge>
                        {report.status === "published" && (
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => adminFinancialApi.exportPayments()}>
                            <Download className="size-3.5 mr-1" />
                            Export
                          </Button>
                        )}
                      </div>
                    </div>
                  </AdminCard>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : (
            <AdminCard className="overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Reference</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Member</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Description</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Method</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAdminPayments.map((payment) => {
                      const MethodIcon = methodIcon[payment.method] || CreditCard;
                      const statusConf = paymentStatusConfig[payment.status];
                      return (
                        <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                          <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{payment.reference}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{payment.memberName}</p>
                            <p className="text-xs text-muted-foreground">{payment.memberNbaNumber}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{payment.description}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <MethodIcon className="size-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground capitalize">{payment.method.replace("_", " ")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">₦{payment.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={cn("text-xs", statusConf.className)}>{statusConf.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-border">
                {mockAdminPayments.map((payment) => {
                  const statusConf = paymentStatusConfig[payment.status];
                  return (
                    <div key={payment.id} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground">{payment.memberName}</p>
                        <Badge variant="outline" className={cn("text-xs", statusConf.className)}>{statusConf.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{payment.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">₦{payment.amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">{payment.reference}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
