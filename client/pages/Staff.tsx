import { MainLayout } from "@/components/layout/MainLayout";
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
import { useState } from "react";
import {
  Plus,
  Users,
  TrendingUp,
  AlertCircle,
  ChefHat,
  Utensils,
} from "lucide-react";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "chef" | "waiter" | "delivery";
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  salary?: number;
  performance?: number;
}

const mockStaff: StaffMember[] = [
  {
    id: 1,
    name: "Ramesh Kumar",
    email: "ramesh@restaurant.com",
    phone: "9876543210",
    role: "admin",
    status: "active",
    joinDate: "2022-03-15",
    salary: 75000,
    performance: 95,
  },
  {
    id: 2,
    name: "Vikram Singh",
    email: "vikram@restaurant.com",
    phone: "9876543211",
    role: "manager",
    status: "active",
    joinDate: "2022-08-20",
    salary: 55000,
    performance: 88,
  },
  {
    id: 3,
    name: "Arjun Verma",
    email: "arjun@restaurant.com",
    phone: "9876543212",
    role: "chef",
    status: "active",
    joinDate: "2021-12-10",
    salary: 45000,
    performance: 92,
  },
  {
    id: 4,
    name: "Pooja Sharma",
    email: "pooja@restaurant.com",
    phone: "9876543213",
    role: "waiter",
    status: "active",
    joinDate: "2023-06-05",
    salary: 25000,
    performance: 85,
  },
  {
    id: 5,
    name: "Ravi Gupta",
    email: "ravi@restaurant.com",
    phone: "9876543214",
    role: "delivery",
    status: "on-leave",
    joinDate: "2023-04-15",
    salary: 22000,
    performance: 78,
  },
];

const roleIcons: Record<string, React.ReactNode> = {
  admin: "👨‍💼",
  manager: "👨‍✈️",
  chef: "👨‍🍳",
  waiter: "🧑‍🍳",
  delivery: "🚴",
};

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  const filteredStaff =
    selectedRole === "all" ? staff : staff.filter((s) => s.role === selectedRole);

  const totalSalaries = staff.reduce((sum, s) => sum + (s.salary || 0), 0);
  const activeCount = staff.filter((s) => s.status === "active").length;
  const onLeaveCount = staff.filter((s) => s.status === "on-leave").length;
  const averagePerformance = Math.round(
    staff.reduce((sum, s) => sum + (s.performance || 0), 0) / staff.length
  );

  const roleCounts = {
    admin: staff.filter((s) => s.role === "admin").length,
    manager: staff.filter((s) => s.role === "manager").length,
    chef: staff.filter((s) => s.role === "chef").length,
    waiter: staff.filter((s) => s.role === "waiter").length,
    delivery: staff.filter((s) => s.role === "delivery").length,
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingStaff(false);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage team members, roles, and performance
            </p>
          </div>
          <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Full Name</Label>
                  <Input id="staff-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email</Label>
                  <Input
                    id="staff-email"
                    placeholder="john@restaurant.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-phone">Phone</Label>
                  <Input id="staff-phone" placeholder="9876543210" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-role">Role</Label>
                  <Select>
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
                    placeholder="45000"
                    type="number"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingStaff(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Staff</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold mt-2">{staff.length}</p>
                  <p className="text-xs text-green-600 mt-2">
                    {activeCount} active
                  </p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Monthly Payroll
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    ₹{(totalSalaries / 100000).toFixed(1)}L
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {staff.length} employees
                  </p>
                </div>
                <ChefHat className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg Performance
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {averagePerformance}/100
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Overall rating
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">On Leave</p>
                  <p className="text-2xl font-bold mt-2">{onLeaveCount}</p>
                  <p className="text-xs text-amber-600 mt-2">Currently absent</p>
                </div>
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(roleCounts).map(([role, count]) => (
            <Card key={role}>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl">{roleIcons[role]}</p>
                <p className="text-sm text-muted-foreground mt-2 capitalize">
                  {role}s
                </p>
                <p className="text-2xl font-bold mt-2">{count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">All Staff</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="roles">By Role</TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Performance
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          Salary
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-border hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium">{member.name}</td>
                          <td className="py-4 px-4 text-sm">{member.email}</td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium capitalize">
                              {member.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {member.status === "active" ? (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                Active
                              </span>
                            ) : member.status === "on-leave" ? (
                              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                                On Leave
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-secondary rounded-full h-2">
                                <div
                                  className="bg-accent h-2 rounded-full"
                                  style={{
                                    width: `${member.performance || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold">
                                {member.performance}/100
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold">
                            {member.salary
                              ? `₹${member.salary.toLocaleString()}`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff
                    .sort((a, b) => (b.performance || 0) - (a.performance || 0))
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {member.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-40 bg-secondary rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full"
                              style={{
                                width: `${member.performance || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold min-w-12 text-right">
                            {member.performance}/100
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(roleCounts).map(([role, _count]) => (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="capitalize">{role}s</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {staff
                        .filter((s) => s.role === role)
                        .map((member) => (
                          <div key={member.id} className="p-3 border border-border rounded-lg">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                                {member.status}
                              </span>
                              {member.salary && (
                                <span className="text-xs font-semibold">
                                  ₹{member.salary}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
