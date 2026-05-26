'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getEmployees, createEmployee } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import { EMPLOYMENT_STATUS_COLORS } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Users, Search, Plus, LayoutGrid, List, Mail, Phone,
  Building2, Calendar, ChevronRight, UserCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeData {
  id: string; employeeId: string; firstName: string; lastName: string; email: string; phone: string | null;
  designation: string; jobTitle: string | null; employmentType: string; status: string; joiningDate: string;
  department: { id: string; name: string }; branch: { id: string; name: string } | null; company: { id: string; name: string };
}

export function Employees() {
  const { currentCompany } = useAppStore();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    designation: '', department: '', employmentType: 'full_time',
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (deptFilter !== 'all') params.departmentId = deptFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (currentCompany?.id) params.companyId = currentCompany.id;
      const res = await getEmployees(params);
      setEmployees(res.data || []);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, deptFilter, statusFilter, currentCompany?.id]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const departments = [...new Set(employees.map(e => e.department?.name).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || emp.department?.name === deptFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddEmployee = async () => {
    try {
      setSubmitting(true);
      await createEmployee({
        ...form,
        companyId: currentCompany?.id,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
      toast.success('Employee created successfully');
      setShowAddDialog(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', designation: '', department: '', employmentType: 'full_time' });
      fetchEmployees();
    } catch {
      toast.error('Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground text-sm">Manage your organization&apos;s workforce</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{employees.length}</p>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{employees.filter(e => e.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{employees.filter(e => e.status === 'probation').length}</p>
            <p className="text-xs text-muted-foreground">On Probation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{employees.filter(e => e.status === 'on_leave').length}</p>
            <p className="text-xs text-muted-foreground">On Leave</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="probation">Probation</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="notice_period">Notice Period</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Employee Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map(emp => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-3">
                  <span className="text-white text-lg font-bold">{emp.firstName[0]}{emp.lastName[0]}</span>
                </div>
                <h3 className="font-semibold text-sm">{emp.firstName} {emp.lastName}</h3>
                <p className="text-xs text-muted-foreground">{emp.designation}</p>
                <p className="text-xs text-muted-foreground">{emp.department?.name || 'N/A'}</p>
                <Badge className={`mt-2 text-[10px] ${EMPLOYMENT_STATUS_COLORS[emp.status] || 'bg-slate-100 text-slate-800'}`}>
                  {emp.status.replace('_', ' ')}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEmployees.map(emp => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{emp.firstName[0]}{emp.lastName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                    <Badge className={`text-[10px] ${EMPLOYMENT_STATUS_COLORS[emp.status] || ''}`}>{emp.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{emp.designation} · {emp.department?.name || 'N/A'}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{emp.email}</span>
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{emp.company?.name || 'N/A'}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-lg">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold">{selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}</span>
                  </div>
                  <div>
                    <div>{selectedEmployee.firstName} {selectedEmployee.lastName}</div>
                    <Badge className={`text-xs ${EMPLOYMENT_STATUS_COLORS[selectedEmployee.status] || ''}`}>{selectedEmployee.status.replace('_', ' ')}</Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>Employee Details</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ID:</span> {selectedEmployee.employeeId}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Dept:</span> {selectedEmployee.department?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span> {selectedEmployee.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined:</span> {selectedEmployee.joiningDate}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Designation:</span> {selectedEmployee.designation}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Company:</span> {selectedEmployee.company?.name || 'N/A'}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Fill in the details to create a new employee record</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">First Name</Label>
                <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Last Name</Label>
                <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Email</Label>
              <Input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Phone</Label>
              <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Designation</Label>
              <Input placeholder="Job title / designation" value={form.designation} onChange={(e) => setForm(f => ({ ...f, designation: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Department</Label>
              <Input placeholder="Department name" value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => setForm(f => ({ ...f, employmentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddEmployee} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
