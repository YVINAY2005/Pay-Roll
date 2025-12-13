import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SalarySlip } from '@/types';
import { getSalarySlips, saveSalarySlip, initializeMockData, mockEmployees } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SalarySlips = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlip, setEditingSlip] = useState<SalarySlip | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
  });

  useEffect(() => {
    initializeMockData();
    loadSlips();
  }, [user?.id, isAdmin]);

  const loadSlips = () => {
    const slips = isAdmin ? getSalarySlips() : getSalarySlips(user?.id);
    setSalarySlips(slips);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      month: '',
      year: new Date().getFullYear(),
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
    });
    setEditingSlip(null);
  };

  const handleEdit = (slip: SalarySlip) => {
    setEditingSlip(slip);
    setFormData({
      employeeId: slip.employeeId,
      month: slip.month,
      year: slip.year,
      basicSalary: slip.basicSalary,
      allowances: slip.allowances,
      deductions: slip.deductions,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employee = mockEmployees.find(emp => emp.id === formData.employeeId);
    if (!employee && !editingSlip) {
      toast.error('Please select an employee');
      return;
    }

    const netSalary = formData.basicSalary + formData.allowances - formData.deductions;
    
    const slip: SalarySlip = {
      id: editingSlip?.id || crypto.randomUUID(),
      employeeId: formData.employeeId || editingSlip?.employeeId || '',
      employeeName: employee?.name || editingSlip?.employeeName || '',
      month: formData.month,
      year: formData.year,
      basicSalary: formData.basicSalary,
      allowances: formData.allowances,
      deductions: formData.deductions,
      netSalary,
      status: 'issued',
      createdAt: editingSlip?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSalarySlip(slip);
    loadSlips();
    setIsDialogOpen(false);
    resetForm();
    toast.success(editingSlip ? 'Salary slip updated successfully' : 'Salary slip created successfully');
  };

  const getStatusBadge = (status: SalarySlip['status']) => {
    return status === 'issued' ? (
      <Badge className="bg-success/10 text-success">Issued</Badge>
    ) : (
      <Badge variant="secondary">Draft</Badge>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isAdmin ? 'Salary Slips' : 'My Salary Slips'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isAdmin ? 'Create and manage employee salary slips' : 'View your salary slip history'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4" />
                Create Salary Slip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSlip ? 'Edit Salary Slip' : 'Create Salary Slip'}</DialogTitle>
                <DialogDescription>
                  {editingSlip ? 'Update the salary slip details' : 'Fill in the details to create a new salary slip'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingSlip && (
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData({ ...formData, month: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Basic Salary (₹)</Label>
                  <Input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Allowances (₹)</Label>
                    <Input
                      type="number"
                      value={formData.allowances}
                      onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deductions (₹)</Label>
                    <Input
                      type="number"
                      value={formData.deductions}
                      onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Net Salary</p>
                  <p className="text-xl font-bold text-foreground">
                    ₹{(formData.basicSalary + formData.allowances - formData.deductions).toLocaleString()}
                  </p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient">
                    {editingSlip ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Salary Slips Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Salary Slip History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Month/Year</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {salarySlips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 6} className="text-center py-8 text-muted-foreground">
                    No salary slips found
                  </TableCell>
                </TableRow>
              ) : (
                salarySlips.map((slip) => (
                  <TableRow key={slip.id} className="hover:bg-muted/50 transition-colors">
                    {isAdmin && (
                      <TableCell className="font-medium">{slip.employeeName}</TableCell>
                    )}
                    <TableCell>{slip.month} {slip.year}</TableCell>
                    <TableCell>₹{slip.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-success">+₹{slip.allowances.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">-₹{slip.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{slip.netSalary.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(slip.status)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(slip)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalarySlips;
