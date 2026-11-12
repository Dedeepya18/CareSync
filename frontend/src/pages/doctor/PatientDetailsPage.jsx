import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService, recordService } from '../../services/api';
import MetricLineChart from '../../components/charts/MetricLineChart';
import Modal from '../../components/common/Modal';
import AISummaryModal from '../../components/ai/AISummaryModal';
import {
  User,
  Activity,
  Heart,
  Droplet,
  Pill,
  BookOpen,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Plus,
  RefreshCw,
  Send,
  Download,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const PatientDetailsPage = () => {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const { addToast } = useNotification();

  // Clinical observation form
  const [noteForm, setNoteForm] = useState({
    title: 'Clinical Review & Preventive Guidance',
    observation: '',
    generalGuidance: '',
    recommendedTests: '',
    followUpDate: '',
  });

  const fetchPatientDetails = async () => {
    try {
      const res = await doctorService.getPatientDetails(patientId);
      setPatientData(res.data.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load patient records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteForm.observation || !noteForm.generalGuidance) {
      addToast('Please provide both observation and guidance.', 'error');
      return;
    }

    setSubmittingNote(true);
    try {
      const payload = {
        patientId,
        title: noteForm.title,
        observation: noteForm.observation,
        generalGuidance: noteForm.generalGuidance,
        recommendedTests: noteForm.recommendedTests
          ? noteForm.recommendedTests.split(',').map((t) => t.trim())
          : [],
        followUpDate: noteForm.followUpDate || null,
      };

      await doctorService.addNote(payload);
      addToast('Observation note documented and shared with patient.', 'success');
      setShowNoteModal(false);
      setNoteForm({
        title: 'Clinical Review & Preventive Guidance',
        observation: '',
        generalGuidance: '',
        recommendedTests: '',
        followUpDate: '',
      });
      fetchPatientDetails();
    } catch (err) {
      addToast('Failed to record doctor note.', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold">Accessing Consented Patient Records...</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>Patient record not accessible or unauthorized.</p>
        <Link to="/doctor-dashboard" className="text-teal-600 font-bold text-xs mt-2 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const { patient, profile, permissions, metrics, alerts, medications, symptoms, records, notes } = patientData;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/doctor-dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Roster
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Generate AI Patient Summary
          </button>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-teal-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> Add Observation & Guidance
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {patient?.name ? patient.name.charAt(0) : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{patient?.name}</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Blood Group: {profile?.bloodGroup || 'O+'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Email: {patient?.email} • Phone: {patient?.phone || 'Not provided'}
            </p>
            {profile?.chronicConditions?.length > 0 && (
              <p className="text-xs text-amber-800 mt-1 font-semibold">
                Conditions: {profile.chronicConditions.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
          <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
            Patient Consented Modules:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {permissions?.shareVitals && <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">Vitals</span>}
            {permissions?.shareMedications && <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">Meds</span>}
            {permissions?.shareSymptoms && <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">Symptoms</span>}
            {permissions?.shareMedicalRecords && <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">Lab Files</span>}
          </div>
        </div>
      </div>

      {/* Vitals Trajectory Chart */}
      {permissions?.shareVitals && metrics && (
        <div className="space-y-6">
          <MetricLineChart
            data={metrics}
            title={`${patient?.name} - Blood Pressure Trajectory`}
            metricKey="systolicBP"
            metricKey2="diastolicBP"
            showDual={true}
            label1="Systolic"
            label2="Diastolic"
            color1="#0d9488"
            color2="#f43f5e"
            unit="mmHg"
          />
        </div>
      )}

      {/* Clinical Notes & Observations History */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" /> Clinical Guidance & Observations ({notes?.length || 0})
        </h3>

        {(!notes || notes.length === 0) ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No clinical observations recorded yet for this patient. Click "Add Observation & Guidance" above.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <span className="text-slate-400 text-[11px] font-semibold">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Observation: </span>
                  <p className="text-slate-600 mt-0.5">{n.observation}</p>
                </div>
                <div>
                  <span className="font-semibold text-teal-800">General Guidance: </span>
                  <p className="text-teal-900 mt-0.5">{n.generalGuidance}</p>
                </div>
                {n.recommendedTests?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-semibold text-slate-700">Recommended Tests: </span>
                    <span className="text-slate-600">{n.recommendedTests.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consented Medical Records */}
      {permissions?.shareMedicalRecords && records && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" /> Patient Medical Documents ({records.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {records.map((r) => (
              <div key={r._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{r.title}</h4>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {r.documentType.replace('_', ' ')} • {new Date(r.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                <a
                  href={`/api/records/${r._id}/download`}
                  className="px-3 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Observation Note Modal */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Record Clinical Guidance">
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Observation *</label>
            <textarea
              rows={3}
              value={noteForm.observation}
              onChange={(e) => setNoteForm({ ...noteForm, observation: e.target.value })}
              placeholder="e.g. Reviewed 14-day vital logs. Noted gradual systolic rise from 122 to 140 mmHg."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">General Guidance / Lifestyle Advice *</label>
            <textarea
              rows={3}
              value={noteForm.generalGuidance}
              onChange={(e) => setNoteForm({ ...noteForm, generalGuidance: e.target.value })}
              placeholder="e.g. Maintain dietary sodium under 2,000 mg/day. Hydrate well and continue twice-daily logging."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Follow-up Tests (comma separated)</label>
            <input
              type="text"
              value={noteForm.recommendedTests}
              onChange={(e) => setNoteForm({ ...noteForm, recommendedTests: e.target.value })}
              placeholder="e.g. 24-Hour Ambulatory Blood Pressure Monitor, Serum Electrolytes"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNoteModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingNote}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {submittingNote ? 'Saving...' : 'Document Observation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Summary Modal */}
      {showAIModal && (
        <AISummaryModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          patientId={patientId}
        />
      )}
    </div>
  );
};

export default PatientDetailsPage;

