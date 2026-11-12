import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Settings, Shield, User, Lock, Save, FileCheck, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile({ name, phone });
      updateUser(res.data.user);
      addToast('Account profile updated successfully.', 'success');
    } catch (err) {
      addToast('Failed to update account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Security</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage profile information and review healthcare privacy specifications</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600" /> Account Information
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Role</label>
              <input
                type="text"
                disabled
                value={user?.role?.toUpperCase() || ''}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-teal-700 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Healthcare Data Privacy & Security Architecture Explanation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" /> Healthcare Data Privacy & Security Governance
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          CareSync is built according to preventive healthcare compliance best practices. As a CSE capstone project, it demonstrates the core technical tenants of the Health Insurance Portability and Accountability Act (HIPAA Security Rule):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Sovereign Consent Ledger
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Medical data is never automatically exposed to clinicians. Access is strictly mediated via patient-granted consent tokens with granular module toggles and instantaneous revocation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Cryptographic Integrity
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Passwords hashed using one-way adaptive salt rounds with <strong>bcrypt</strong> (cost factor 10). Ephemeral session validation is enforced with cryptographically signed JSON Web Tokens (JWT).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Role-Based Access Control (RBAC)
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Strict middleware gates partition endpoints across <code>patient</code>, <code>doctor</code>, and <code>admin</code> tiers, preventing IDOR (Insecure Direct Object Reference) vulnerabilities.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Defense-in-Depth File Protection
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Uploaded medical documents are sanitized with randomized storage names, filtered by strict MIME-type allowlists, size capped at 10MB, and served through authenticated download handlers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

