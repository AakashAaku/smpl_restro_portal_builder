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
import { useState, useEffect } from "react";
import { Plus, Users, Shield, Trash2, Edit2, Loader2, Key } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/layout/AdminHeader";

// Simplified type based on what we need here
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF"
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const getAuthToken = () => localStorage.getItem("auth_token");

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error("Failed to load users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load system users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNewUser = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "STAFF"
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Leave blank so we only update if typed
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save user");
      }

      toast.success(editingId ? "User updated successfully" : "User created successfully");
      setIsDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? They will lose access immediately.")) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="System Users" 
        subtitle="Manage login access, roles, and permissions"
        actions={
          <Button onClick={handleOpenNewUser} className="font-bold gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            CREATE USER
          </Button>
        }
      />

      <Card className="border-none shadow-xl">
        <CardHeader className="bg-slate-50/50 border-b border-sidebar-border/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Access Control</CardTitle>
              <p className="text-sm text-muted-foreground">Active directory of all registered system users.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60 rounded-tl-xl">User</th>
                  <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Email</th>
                  <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">System Role</th>
                  <th className="text-left py-4 px-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Joined</th>
                  <th className="text-right py-4 px-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60 rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-sidebar-border/30 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-medium">
                      {user.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        user.role === 'KITCHEN_STAFF' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        user.role === 'RECEPTION' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleOpenEditUser(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {editingId ? "Edit User Credentials" : "Create New User Access"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label>Email (Login ID)</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Password {editingId && <span className="text-xs font-normal text-muted-foreground">(Leave blank to keep unchanged)</span>}</Label>
              <Input
                type="password"
                required={!editingId}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingId ? "••••••••" : "Secure password"}
              />
            </div>

            <div className="space-y-2">
              <Label>System Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                  <SelectItem value="KITCHEN_STAFF">Kitchen Staff (Kitchen & Inventory)</SelectItem>
                  <SelectItem value="RECEPTION">Reception (Orders & Requisitions)</SelectItem>
                  <SelectItem value="STAFF">General Staff</SelectItem>
                  <SelectItem value="CHEF">Chef</SelectItem>
                  <SelectItem value="WAITER">Waiter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
