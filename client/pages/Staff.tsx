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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
              VenzoSmart • Talent & Culture
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-sidebar-foreground">
            Team <span className="text-primary italic">Directory</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            "Empowering the Culinary Craftsmen of Bhaktapur"
          </p>
        </div>
        <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 rounded-xl font-bold border-none shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02]">
              <Plus className="h-5 w-5" />
              ONBOARD NEW MEMBER
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStaff} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name</Label>
                <Input
                  id="staff-name"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-phone">Phone</Label>
                <Input
                  id="staff-phone"
                  required
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-role">Role</Label>
                <Select
                  value={staffForm.role}
                  onValueChange={(val: StaffMember["role"]) => setStaffForm({ ...staffForm, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
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
                <Label htmlFor="staff-salary">Salary (Optional)</Label>
                <Input
                  id="staff-salary"
                  type="number"
                  value={staffForm.salary}
                  onChange={(e) => setStaffForm({ ...staffForm, salary: Number(e.target.value) })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="submit">Add Staff</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card border-none shadow-lg overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Human Capital</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">{staff.length}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">{stats?.activeStaff || 0} active specialists</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Monthly Yield</p>
                <p className="text-3xl font-black tracking-tight text-emerald-700">
                  Rs.{(stats?.monthlyPayroll || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">Total payroll commitment</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Performance Index</p>
                <p className="text-3xl font-black tracking-tight text-sidebar-foreground">
                  {stats?.avgPerformance || 0}<span className="text-sm text-muted-foreground">/100</span>
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">Team aggregate score</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-1">Attendance Gap</p>
                <p className="text-3xl font-black tracking-tight text-amber-600">{stats?.onLeaveCount || 0}</p>
                <p className="text-[10px] text-amber-600 font-bold mt-2">Currently on leave</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <AlertCircle className="h-6 w-6" />
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
