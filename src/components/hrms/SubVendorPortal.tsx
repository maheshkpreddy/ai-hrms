'use client'

import { useState } from 'react'
import {
  UsersRound,
  Plus,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  Download,
  Eye,
  Filter,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubVendor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  specialization: string
  status: 'active' | 'inactive' | 'pending'
  resumesUploaded: number
  assignedRequirements: number
}

interface ResumeEntry {
  id: string
  vendorId: string
  vendorName: string
  candidateName: string
  email: string
  phone: string
  skills: string[]
  experience: string
  position: string
  status: 'new' | 'screening' | 'shortlisted' | 'rejected' | 'hired'
  uploadedAt: string
  resumeUrl: string
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const sampleVendors: SubVendor[] = [
  { id: 'v1', name: 'Suresh Kumar', company: 'TechStaff Solutions', email: 'suresh@techstaff.com', phone: '+91-9876543220', specialization: 'IT & Software', status: 'active', resumesUploaded: 45, assignedRequirements: 8 },
  { id: 'v2', name: 'Lakshmi Reddy', company: 'HR Connect Pro', email: 'lakshmi@hrconnect.com', phone: '+91-9876543221', specialization: 'Healthcare & Pharma', status: 'active', resumesUploaded: 32, assignedRequirements: 5 },
  { id: 'v3', name: 'Mohammed Ali', company: 'RecruitFirst Agency', email: 'ali@recruitfirst.com', phone: '+91-9876543222', specialization: 'Finance & Banking', status: 'active', resumesUploaded: 28, assignedRequirements: 6 },
  { id: 'v4', name: 'Deepa Nair', company: 'TalentBridge Inc', email: 'deepa@talentbridge.com', phone: '+91-9876543223', specialization: 'Engineering & Manufacturing', status: 'pending', resumesUploaded: 12, assignedRequirements: 2 },
  { id: 'v5', name: 'Ravi Shankar', company: 'ProHire Services', email: 'ravi@prohire.com', phone: '+91-9876543224', specialization: 'Sales & Marketing', status: 'inactive', resumesUploaded: 18, assignedRequirements: 0 },
]

const sampleResumes: ResumeEntry[] = [
  { id: 'r1', vendorId: 'v1', vendorName: 'TechStaff Solutions', candidateName: 'Anil Mehta', email: 'anil@gmail.com', phone: '+91-9999000001', skills: ['React', 'Node.js', 'TypeScript'], experience: '5 years', position: 'Senior Frontend Developer', status: 'shortlisted', uploadedAt: '2024-02-05', resumeUrl: '#' },
  { id: 'r2', vendorId: 'v1', vendorName: 'TechStaff Solutions', candidateName: 'Kavitha Sharma', email: 'kavitha@gmail.com', phone: '+91-9999000002', skills: ['Python', 'Django', 'AWS'], experience: '3 years', position: 'Backend Developer', status: 'screening', uploadedAt: '2024-02-04', resumeUrl: '#' },
  { id: 'r3', vendorId: 'v2', vendorName: 'HR Connect Pro', candidateName: 'Dr. Sanjay Gupta', email: 'sanjay@gmail.com', phone: '+91-9999000003', skills: ['Pharmacology', 'Clinical Research', 'Regulatory'], experience: '8 years', position: 'Clinical Research Manager', status: 'new', uploadedAt: '2024-02-03', resumeUrl: '#' },
  { id: 'r4', vendorId: 'v3', vendorName: 'RecruitFirst Agency', candidateName: 'Ritu Agarwal', email: 'ritu@gmail.com', phone: '+91-9999000004', skills: ['CA', 'Taxation', 'Audit'], experience: '6 years', position: 'Finance Manager', status: 'hired', uploadedAt: '2024-02-02', resumeUrl: '#' },
  { id: 'r5', vendorId: 'v4', vendorName: 'TalentBridge Inc', candidateName: 'Pradeep Reddy', email: 'pradeep@gmail.com', phone: '+91-9999000005', skills: ['AutoCAD', 'Project Management', 'Civil Engineering'], experience: '4 years', position: 'Project Engineer', status: 'rejected', uploadedAt: '2024-02-01', resumeUrl: '#' },
]

const resumeStatusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  screening: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  hired: 'bg-purple-100 text-purple-700',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubVendorPortal() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'resumes'>('vendors')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVendors = sampleVendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredResumes = sampleResumes.filter(
    (r) =>
      r.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeVendors = sampleVendors.filter((v) => v.status === 'active').length
  const totalResumes = sampleResumes.length
  const shortlisted = sampleResumes.filter((r) => r.status === 'shortlisted').length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
              <UsersRound className="h-7 w-7 text-orange-600" />
              Sub Vendors
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage sub vendors and their resume uploads for recruitment requirements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 pl-8 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="size-3.5" />
              Upload Resume
            </Button>
            <Button size="sm" className="gap-1.5 bg-orange-600 hover:bg-orange-700">
              <Plus className="size-3.5" />
              Add Vendor
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2"><UsersRound className="h-4 w-4 text-orange-700" /></div>
              <div>
                <p className="text-xl font-bold">{sampleVendors.length}</p>
                <p className="text-[10px] text-muted-foreground">Total Vendors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" /></div>
              <div>
                <p className="text-xl font-bold">{activeVendors}</p>
                <p className="text-[10px] text-muted-foreground">Active Vendors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2"><FileText className="h-4 w-4 text-blue-700" /></div>
              <div>
                <p className="text-xl font-bold">{totalResumes}</p>
                <p className="text-[10px] text-muted-foreground">Total Resumes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2"><CheckCircle2 className="h-4 w-4 text-emerald-700" /></div>
              <div>
                <p className="text-xl font-bold">{shortlisted}</p>
                <p className="text-[10px] text-muted-foreground">Shortlisted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switch */}
        <div className="mb-6 flex gap-1 border-b">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'vendors'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UsersRound className="size-4 inline mr-1.5" />
            Vendors
          </button>
          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'resumes'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="size-4 inline mr-1.5" />
            Resumes
          </button>
        </div>

        {/* Content */}
        {activeTab === 'vendors' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                          {vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm">{vendor.name}</h3>
                        <p className="text-xs text-muted-foreground">{vendor.company}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        vendor.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 text-[9px]'
                          : vendor.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 text-[9px]'
                          : 'bg-slate-100 text-slate-700 text-[9px]'
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Building2 className="size-3" />{vendor.specialization}</div>
                    <div className="flex items-center gap-2"><Mail className="size-3" />{vendor.email}</div>
                    <div className="flex items-center gap-2"><Phone className="size-3" />{vendor.phone}</div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex gap-3 text-xs">
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{vendor.resumesUploaded}</strong> resumes
                      </span>
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{vendor.assignedRequirements}</strong> requirements
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{resume.candidateName}</h3>
                        <Badge className={`text-[9px] ${resumeStatusColors[resume.status]}`} variant="secondary">
                          {resume.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{resume.position} | {resume.experience}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {resume.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Uploaded by {resume.vendorName} on {resume.uploadedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-7" title="View Resume">
                        <Eye className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7" title="Download Resume">
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
