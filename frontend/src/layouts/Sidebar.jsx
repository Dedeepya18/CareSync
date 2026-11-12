import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Activity,
  TrendingUp,
  Pill,
  BookOpen,
  FileText,
  AlertTriangle,
  Award,
  Share2,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';

const Sidebar = () => {
  const { isPatient, isDoctor, isAdmin } = useAuth();

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/health-profile', label: 'Health Profile', icon: User },
    { to: '/health-metrics', label: 'Record Vitals', icon: Activity },
    { to: '/health-trends', label: 'Health Trends', icon: TrendingUp },
    { to: '/medications', label: 'Medications', icon: Pill },
    { to: '/symptoms', label: 'Symptom Journal', icon: BookOpen },
    { to: '/medical-records', label: 'Medical Records', icon: FileText },
    { to: '/alerts', label: 'Preventive Alerts', icon: AlertTriangle },
    { to: '/wellness-score', label: 'Wellness Score', icon: Award },
    { to: '/consent', label: 'Doctor Sharing', icon: Share2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const doctorLinks = [
    { to: '/doctor-dashboard', label: 'Doctor Overview', icon: LayoutDashboard },
    { to: '/doctor/profile', label: 'Doctor Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin-dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const links = isPatient ? patientLinks : isDoctor ? doctorLinks : adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          {isPatient ? 'Patient Portal' : isDoctor ? 'Doctor Portal' : 'Admin Portal'}
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
          <p className="text-[11px] font-bold text-slate-700">CareSync Platform</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Preventive Patient Monitoring</p>
          <div className="mt-2 text-[10px] text-teal-600 font-semibold bg-teal-50 py-1 rounded-lg">
            v1.0 CSE Final Edition
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

