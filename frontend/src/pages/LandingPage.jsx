import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Activity,
  TrendingUp,
  Shield,
  Pill,
  Sparkles,
  FileText,
  Share2,
  Award,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Health Trend Intelligence',
      description:
        'Instead of crude static threshold alarms, CareSync analyzes multi-day trajectories to detect gradual shifts—such as a 12% rise in systolic blood pressure over 7 days—with clear explainable reasoning.',
      color: 'bg-teal-50 text-teal-600',
    },
    {
      icon: Award,
      title: 'Holistic Wellness Score',
      description:
        'A comprehensive 0–100 indicator evaluating sleep duration, resting heart rate, blood pressure, medication adherence, and active symptoms for early awareness.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: Pill,
      title: 'Medication Adherence Engine',
      description:
        'Daily digital pill schedule with taken/missed logging, automated reminder schedules, and longitudinal compliance analytics.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Share2,
      title: 'Granular Doctor Consent Sharing',
      description:
        'Patients maintain sovereign control over their records. Authorize specific doctors to review vitals, symptoms, or lab reports, with one-click revocation.',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      icon: Sparkles,
      title: 'AI Preventive Health Assistant',
      description:
        'Synthesizes multi-stream health data into a concise clinical briefing accompanied by intelligent questions to bring to your next doctor consultation.',
      color: 'bg-violet-50 text-violet-600',
    },
    {
      icon: FileText,
      title: 'Secure Medical Records Vault',
      description:
        'Organize lab tests, prescriptions, and imaging reports in one encrypted location with audit-logged role-based access.',
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>CSE Final Year Engineering Capstone</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Care<span className="text-teal-600">Sync</span>
        </h1>
        <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-700">
          Intelligent Preventive Healthcare & Patient Monitoring Platform
        </p>

        <p className="mt-4 text-slate-500 text-sm sm:text-base leading-relaxed">
          Shifting healthcare from reactive crisis management to proactive early awareness. Track daily vitals, discover subtle physiological shifts before they escalate, and share structured health timelines with your care team.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all flex items-center gap-2"
          >
            Launch Interactive Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm shadow-sm transition-all"
          >
            Create Free Account
          </Link>
        </div>

        {/* Demo Credentials Quick Callout */}
        <div className="mt-8 p-4 bg-slate-100/80 border border-slate-200/80 rounded-2xl inline-block text-left text-xs text-slate-600 max-w-md">
          <span className="font-bold text-slate-800">💡 1-Click Placement Demo Credentials:</span>
          <div className="mt-1 space-y-0.5">
            <div>Patient (John Doe - Upward BP Trend): <span className="font-mono font-semibold">john@caresync.health</span> (Password123!)</div>
            <div>Doctor (Dr. Emily Chen - Cardiologist): <span className="font-mono font-semibold">dr.chen@caresync.health</span> (Password123!)</div>
            <div>Admin (Analytics & Users): <span className="font-mono font-semibold">admin@caresync.health</span> (AdminPassword123!)</div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Preventive Clinical Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A unified multi-parameter architecture designed for patients, doctors, and healthcare administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{feat.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

