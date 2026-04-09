import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  TrendingUp,
  AlertCircle,
  ChefHat,
  Leaf,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Heart
} from "lucide-react";
import {
  StaffMember,
  StaffStats,
  getStaff,
  createStaff,
  getStaffStats
} from "@/lib/staff-api";
import { toast } from "sonner";
import { AdminHeader } from "@/components/layout/AdminHeader";

const roleIcons: Record<string, string> = {
  admin: "👨‍💼",
  manager: "👨‍✈️",
  chef: "👨‍🍳",
  waiter: "🧑‍🍳",
  delivery: "🚴",
};

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    name: "",
    email: "",
    phone: "",
    role: "waiter",
    salary: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [staffData, statsData] = await Promise.all([
        getStaff(),
        getStaffStats()
      ]);
      setStaff(staffData);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load staff data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff =
    selectedRole === "all" ? staff : staff.filter((s) => s.role === selectedRole);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff(staffForm);
      toast.success("Staff member added successfully");
      setIsAddingStaff(false);
      loadData();
      setStaffForm({ name: "", email: "", phone: "", role: "waiter", salary: 0 });
    } catch (error) {
      toast.error("Failed to add staff member");
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Staff Directory" 
        subtitle="Manage your team members, roles, and performance"
        actions={
          <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
            <DialogTrigger asChild>
              <Button className="font-bold gap-2">
                <Plus className="h-4 w-4" />
                ONBOARD NEW MEMBER
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    required
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      required
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      required
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={staffForm.role}
                      onValueChange={(val: any) => setStaffForm({ ...staffForm, role: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="chef">Chef</SelectItem>
                        <SelectItem value="waiter">Waiter</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salary (Rs.)</Label>
                    <Input
                      type="number"
                      value={staffForm.salary}
                      onChange={(e) => setStaffForm({ ...staffForm, salary: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Staff Member</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Total Team</p>
                <p className="text-2xl font-bold">{staff.length}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">{stats?.activeStaff || 0} active</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Monthly Payroll</p>
                <p className="text-2xl font-bold">Rs.{(stats?.monthlyPayroll || 0).toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Avg Performance</p>
                <p className="text-2xl font-bold">{stats?.avgPerformance || 0}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">On Leave</p>
                <p className="text-2xl font-bold text-amber-600">{stats?.onLeaveCount || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stats?.roleCounts && Object.entries(stats.roleCounts).map(([role, count]) => (
          <Card key={role} className="min-w-[150px] flex-shrink-0">
            <CardContent className="pt-6 text-center">
              <p className="text-2xl">{roleIcons[role] || "👤"}</p>
              <p className="text-sm text-muted-foreground mt-2 capitalize">{role}s</p>
              <p className="text-2xl font-bold mt-2">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">All Staff</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Performance</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member.id} className="border-b border-sidebar-border/30 hover:bg-emerald-50/30 transition-colors group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                              {member.name.charAt(0)}
                            </div>
                            <span className="font-bold text-emerald-950">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-black uppercase tracking-tight text-muted-foreground">{member.role}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            member.status === 'on-leave' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-black text-emerald-600">{member.performance || 0}%</td>
                        <td className="py-4 px-4 font-black text-emerald-950">Rs.{(member.salary || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {staff
                  .sort((a, b) => (b.performance || 0) - (a.performance || 0))
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${member.performance || 0}%` }} />
                        </div>
                        <span className="font-bold text-sm w-10 text-right">{member.performance || 0}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
