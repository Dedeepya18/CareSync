import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import HealthProfilePage from './pages/patient/HealthProfilePage';
import HealthMetricsPage from './pages/patient/HealthMetricsPage';
import HealthTrendsPage from './pages/patient/HealthTrendsPage';
import SymptomJournalPage from './pages/patient/SymptomJournalPage';
import MedicationManagementPage from './pages/patient/MedicationManagementPage';
import MedicalRecordsPage from './pages/patient/MedicalRecordsPage';
import AlertsPage from './pages/patient/AlertsPage';
import WellnessScorePage from './pages/patient/WellnessScorePage';
import ConsentManagementPage from './pages/patient/ConsentManagementPage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetailsPage from './pages/doctor/PatientDetailsPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// General Pages
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'patient') return <Navigate to="/dashboard" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected App Routes with DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Patient Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-profile"
          element={
            <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
              <HealthProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-metrics"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <HealthMetricsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-trends"
          element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <HealthTrendsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptoms"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <SymptomJournalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medications"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicationManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicalRecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness-score"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <WellnessScorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consent"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <ConsentManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:patientId"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <PatientDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* General Routes */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

