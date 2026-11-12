import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  FileText,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Server,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { addToast } = useNotification();

  const fetchAdminData = async () => {
    try {
      const [dRes, uRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers({ search, role: roleFilter }),
      ]);
      setDashboard(dRes.data);
      setUsers(uRes.data.users || []);
    } catch (err) {
      addToast('Failed to load admin telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      addToast(res.data.message, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to toggle user status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Accessing Platform Telemetry...</p>
      </div>
    );
  }

  const stats = dashboard?.stats;
  const systemStatus = dashboard?.systemStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
            Administrator Console
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 text-white">
          CareSync System & Governance Hub
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          Global user directory management, multi-tenant role authorizations, and platform-wide health metric volume analytics.
        </p>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          status="primary"
          subtitle={`${stats?.totalPatients || 0} Patients • ${stats?.totalDoctors || 0} Doctors`}
        />

        <StatCard
          title="Health Vitals Recorded"
          value={stats?.totalMetrics || 0}
          icon={Activity}
          status="success"
          subtitle="Longitudinal logs"
        />

        <StatCard
          title="Intelligent Alerts Generated"
          value={stats?.totalAlerts || 0}
          icon={AlertTriangle}
          status="warning"
          subtitle="Trend anomaly triggers"
        />

        <StatCard
          title="Medical Documents Stored"
          value={stats?.totalRecords || 0}
          icon={FileText}
          status="neutral"
          subtitle="Encrypted lab & scan assets"
        />
      </div>

      {/* System Status Callout */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-slate-800">Operational Environment:</span>
          <span className="font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
            {systemStatus?.environment}
          </span>
          <span className="font-bold text-slate-800 ml-2">Database:</span>
          <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            {systemStatus?.database}
          </span>
        </div>
        <div className="text-slate-400">
          Uptime: <span className="font-bold text-slate-700">{Math.round(systemStatus?.uptime || 0)}s</span>
        </div>
      </div>

      {/* User Governance Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            User Directory Management ({users.length})
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Roles</option>
              <option value="patient">Patients Only</option>
              <option value="doctor">Doctors Only</option>
              <option value="admin">Administrators</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="pb-3 px-2">User</th>
                <th className="pb-3 px-2">Email</th>
                <th className="pb-3 px-2">Role</th>
                <th className="pb-3 px-2">Registered On</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      {u.name ? u.name.charAt(0) : 'U'}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'doctor'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-400 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

