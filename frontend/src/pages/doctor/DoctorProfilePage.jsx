import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import { Stethoscope, Shield, Save, RefreshCw, Award, Building, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const DoctorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useNotification();

  const [form, setForm] = useState({
    specialization: '',
    hospitalAffiliation: '',
    experienceYears: 0,
    qualifications: '',
    bio: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorService.getProfile();
        const p = res.data.profile;
        setProfile(p);
        if (p) {
          setForm({
            specialization: p.specialization || '',
            hospitalAffiliation: p.hospitalAffiliation || '',
            experienceYears: p.experienceYears || 0,
            qualifications: p.qualifications ? p.qualifications.join(', ') : '',
            bio: p.bio || '',
          });
        }
      } catch (err) {
        addToast('Failed to load doctor profile.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        qualifications: form.qualifications.split(',').map((q) => q.trim()),
      };
      const res = await doctorService.updateProfile(payload);
      setProfile(res.data.profile);
      addToast('Doctor credentials updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Loading Doctor Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Doctor Profile & Credentials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Maintain your verified clinical licensing, hospital affiliations, and medical specialty.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {profile?.user?.name ? profile.user.name.charAt(0) : 'D'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{profile?.user?.name}</h3>
            <p className="text-xs text-slate-500">
              License: <span className="font-mono font-semibold text-slate-700">{profile?.licenseNumber}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medical Specialization</label>
            <input
              type="text"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
            <input
              type="text"
              value={form.hospitalAffiliation}
              onChange={(e) => setForm({ ...form, hospitalAffiliation: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
            <input
              type="number"
              value={form.experienceYears}
              onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications (comma separated)</label>
            <input
              type="text"
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              placeholder="e.g. MD (Cardiology), FACC"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio / Approach</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Describe your preventive care philosophy..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfilePage;

