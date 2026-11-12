import React, { useState, useEffect } from 'react';
import { consentService, patientService } from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Share2,
  ShieldCheck,
  Stethoscope,
  Check,
  X,
  Lock,
  Plus,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ConsentManagementPage = () => {
  const [consents, setConsents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useNotification();

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [notes, setNotes] = useState('Authorized for preventive remote telehealth monitoring.');
  const [permissions, setPermissions] = useState({
    shareVitals: true,
    shareMedications: true,
    shareSymptoms: true,
    shareMedicalRecords: true,
    shareDoctorNotes: true,
  });

  const fetchData = async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        consentService.getConsents(),
        patientService.getDoctorsList(),
      ]);
      setConsents(cRes.data.consents || []);
      setDoctors(dRes.data.doctors || []);
      if (dRes.data.doctors?.length > 0) {
        setSelectedDoctorId(dRes.data.doctors[0].doctorId);
      }
    } catch (err) {
      addToast('Failed to load doctor sharing consents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrantConsent = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      addToast('Please select a doctor.', 'error');
      return;
    }

    try {
      await consentService.createConsent({
        doctorId: selectedDoctorId,
        permissions,
        notes,
      });
      addToast('Data access granted to doctor successfully.', 'success');
      setShowModal(false);
      fetchData();
    } catch (err) {
      addToast('Failed to grant consent.', 'error');
    }
  };

  const handleRevokeConsent = async (consentId) => {
    if (!window.confirm('Are you sure you want to revoke this doctor\'s access to your health data?')) {
      return;
    }
    try {
      await consentService.revokeConsent(consentId);
      addToast('Doctor access revoked. They can no longer inspect your records.', 'info');
      fetchData();
    } catch (err) {
      addToast('Failed to revoke consent.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Loading Consent & Sharing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-bold uppercase tracking-wider border border-teal-200">
              Data Privacy & Access Control
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Doctor Data Sharing & Consent Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            You maintain full sovereignty over your healthcare information. Select doctors to review your records and revoke permissions at any moment.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Authorize New Doctor
        </button>
      </div>

      {/* Active Consents */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
          Authorized Doctors & Audit History ({consents.length})
        </h3>

        {consents.length === 0 ? (
          <div className="text-center py-10">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No Sharing Authorizations Active</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your health data is completely private. You can grant access to your physician or cardiologist anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {consents.map((c) => {
              const isActive = c.status === 'active';
              return (
                <div
                  key={c._id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-slate-50/70 border-slate-200/80'
                      : 'bg-slate-100/40 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                        {c.doctor?.name ? c.doctor.name.charAt(0) : 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{c.doctor?.name}</h4>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{c.doctor?.email}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Granted on {new Date(c.grantedAt).toLocaleDateString()}
                          {c.revokedAt && ` • Revoked on ${new Date(c.revokedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleRevokeConsent(c._id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all self-start sm:self-center"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>

                  {/* Granular Permissions Badges */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Granular Shared Data Modules:
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-lg border font-semibold ${
                          c.permissions?.shareVitals
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        Health Vitals & Trends
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg border font-semibold ${
                          c.permissions?.shareMedications
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        Medications & Adherence
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg border font-semibold ${
                          c.permissions?.shareSymptoms
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        Symptom Diary
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg border font-semibold ${
                          c.permissions?.shareMedicalRecords
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        Uploaded Lab Documents
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grant Consent Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Authorize Doctor Data Sharing">
        <form onSubmit={handleGrantConsent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Verified Doctor *</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            >
              {doctors.map((doc) => (
                <option key={doc.doctorId} value={doc.doctorId}>
                  {doc.name} — {doc.specialization} ({doc.hospitalAffiliation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select What Information to Share:
            </label>
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.shareVitals}
                  onChange={(e) => setPermissions({ ...permissions, shareVitals: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-semibold text-slate-800">Health Vitals & Trend Telemetry</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.shareMedications}
                  onChange={(e) => setPermissions({ ...permissions, shareMedications: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-semibold text-slate-800">Medications & Compliance History</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.shareSymptoms}
                  onChange={(e) => setPermissions({ ...permissions, shareSymptoms: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-semibold text-slate-800">Symptom Journal & Recurring Episodes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.shareMedicalRecords}
                  onChange={(e) => setPermissions({ ...permissions, shareMedicalRecords: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-semibold text-slate-800">Uploaded Medical Records & Blood Reports</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sharing Note / Clinical Purpose</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
            >
              Grant Access
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConsentManagementPage;

