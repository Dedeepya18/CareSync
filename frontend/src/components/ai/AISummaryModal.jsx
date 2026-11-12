import React, { useState } from 'react';
import Modal from '../common/Modal';
import { aiService } from '../../services/api';
import { Sparkles, FileText, Check, Copy, MessageSquare, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const AISummaryModal = ({ isOpen, onClose, patientId }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const { addToast } = useNotification();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await aiService.getHealthSummary(patientId);
      setSummary(res.data.summary);
    } catch (err) {
      addToast('Failed to generate AI health summary. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !summary) {
      handleGenerate();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!summary) return;
    const text = `CARESYNC HEALTH BRIEFING (${summary.timeWindow})
Generated: ${new Date(summary.generatedAt).toLocaleDateString()}

EXECUTIVE OVERVIEW:
${summary.executiveOverview}

OBSERVED TRENDS:
${summary.observedTrends.map((t) => `- ${t}`).join('\n')}

MEDICATION COMPLIANCE:
${summary.medicationAnalysis}

SYMPTOMS:
${summary.symptomHighlights}

QUESTIONS FOR DOCTOR:
${summary.discussionQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

DISCLAIMER:
${summary.disclaimer}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Preventive Health Briefing" maxWidth="max-w-2xl">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-teal-50 text-teal-600 animate-spin mb-4">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">Synthesizing Clinical Signals...</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Correlating historical blood pressure, resting heart rate, medication adherence, and reported symptoms.
          </p>
        </div>
      ) : summary ? (
        <div className="space-y-5">
          {/* Header Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 text-teal-800 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>{summary.source}</span>
            </div>
            <span className="font-semibold text-slate-500">Period: {summary.timeWindow}</span>
          </div>

          {/* Executive Overview */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Executive Overview
            </h5>
            <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
              {summary.executiveOverview}
            </p>
          </div>

          {/* Observed Trends */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Identified Physiological Patterns & Trends
            </h5>
            <div className="space-y-1.5">
              {summary.observedTrends.map((trend, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-amber-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span className="font-medium">{trend}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medication & Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Medication Adherence
              </h5>
              <p className="text-xs text-slate-600">{summary.medicationAnalysis}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Symptom Activity
              </h5>
              <p className="text-xs text-slate-600">{summary.symptomHighlights}</p>
            </div>
          </div>

          {/* Doctor Discussion Questions */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2 text-indigo-900">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h5 className="text-xs font-bold uppercase tracking-wider">
                Recommended Questions to Discuss with Your Doctor
              </h5>
            </div>
            <div className="space-y-2 mt-2">
              {summary.discussionQuestions.map((q, idx) => (
                <div key={idx} className="text-xs text-indigo-950 bg-white/80 p-2.5 rounded-lg border border-indigo-100/70 font-medium">
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>{summary.disclaimer}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleGenerate}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Briefing for Doctor'}
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500 text-sm">
          Failed to load briefing.
        </div>
      )}
    </Modal>
  );
};

export default AISummaryModal;

