'use client';

import React from 'react';
import { useHRMSStore } from '@/lib/store';
import Sidebar from './Sidebar';
import { Header } from './header';

// Import all module components - all use default exports
import Dashboard from './Dashboard';
import EmployeeManagement from './EmployeeManagement';
import CompanyManagement from './CompanyManagement';
import MasterManagement from './MasterManagement';
import TimeAttendance from './TimeAttendance';
import LeaveManagement from './LeaveManagement';
import PayrollExpense from './PayrollExpense';
import Performance from './Performance';
import LearningDevelopment from './LearningDevelopment';
import AssetManagement from './AssetManagement';
import DocumentManagement from './DocumentManagement';
import TaskManagement from './TaskManagement';
import MeetingManagement from './MeetingManagement';
import RBACSecurity from './RBACSecurity';
import TalentAcquisition from './TalentAcquisition';
import AIInterviewModule from './AIInterviewModule';
import RecruitmentModule from './RecruitmentModule';
import OnboardingModule from './OnboardingModule';
import ProjectKanban from './ProjectKanban';
import ClientPortal from './ClientPortal';
import SubVendorManagement from './SubVendorManagement';
import SubVendorPortal from './SubVendorPortal';
import JobPortal from './JobPortal';
import HelpdeskModule from './HelpdeskModule';
import AIChatbot from './AIChatbot';
import WorkflowEngine from './WorkflowEngine';
import Analytics from './Analytics';
import AuditCompliance from './AuditCompliance';
import SelfService from './SelfService';
import ProfileManagement from './ProfileManagement';
import ExitWorkflow from './ExitWorkflow';
import KnowledgeHub from './KnowledgeHub';
import SettingsModule from './SettingsModule';
import { Alumni } from './alumni';
import { Engagement } from './engagement';
import { VendorPortal } from './vendor-portal';
import TimesheetModule from './TimesheetModule';
import { TravelExpense } from './travel-expense';

// Module component mapping - keys MUST match the ModuleKey type in store.ts
const MODULE_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  employees: EmployeeManagement,
  company: CompanyManagement,
  masters: MasterManagement,
  attendance: TimeAttendance,
  leave: LeaveManagement,
  payroll: PayrollExpense,
  performance: Performance,
  learning: LearningDevelopment,
  assets: AssetManagement,
  documents: DocumentManagement,
  tasks: TaskManagement,
  meetings: MeetingManagement,
  rbac: RBACSecurity,
  talent: TalentAcquisition,
  recruitment: RecruitmentModule,
  'ai-interview': AIInterviewModule,
  onboarding: OnboardingModule,
  timesheet: TimesheetModule,
  projects: ProjectKanban,
  clients: ClientPortal,
  vendors: VendorPortal,
  subvendors: SubVendorManagement,
  jobportal: JobPortal,
  helpdesk: HelpdeskModule,
  'ai-chatbot': AIChatbot,
  workflows: WorkflowEngine,
  analytics: Analytics,
  selfservice: SelfService,
  profile: ProfileManagement,
  exit: ExitWorkflow,
  'knowledge-hub': KnowledgeHub,
  settings: SettingsModule,
  audit: AuditCompliance,
  engagement: Engagement,
  alumni: Alumni,
  training: LearningDevelopment,
  compliance: AuditCompliance,
  travel_expense: TravelExpense,
  client_portal: ClientPortal,
  vendor_portal: VendorPortal,
  sub_vendor_portal: SubVendorPortal,
  job_portal: JobPortal,
  ai_interview: AIInterviewModule,
  ai_chatbot: AIChatbot,
  companies: CompanyManagement,
};

export function HRMSLayout() {
  const { activeModule } = useHRMSStore();

  const ActiveComponent = MODULE_COMPONENTS[activeModule] || Dashboard;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="p-4 md:p-6">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
