import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import PatientDoctors from './pages/patient/Doctors';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import PatientCard from './pages/doctor/PatientCard';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminPatients from './pages/admin/Patients';
import AdminCalendar from './pages/admin/Calendar';
import AdminServices from './pages/admin/Services';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// === ВАЖНО: Импорт AuthProvider ===
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>                    {/* ← Обязательная обёртка */}
      <Router>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ПАЦИЕНТ */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<PatientDashboard />} />
                    <Route path="doctors" element={<PatientDoctors />} />
                    <Route path="book" element={<BookAppointment />} />
                    <Route path="appointments" element={<MyAppointments />} />
                    <Route path="*" element={<Navigate to="/patient" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ВРАЧ */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DoctorDashboard />} />
                    <Route path="patients" element={<DoctorPatients />} />
                    <Route path="patient/:id" element={<PatientCard />} />
                    <Route path="*" element={<Navigate to="/doctor" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* АДМИНИСТРАТОР */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="patients" element={<AdminPatients />} />
                    <Route path="calendar" element={<AdminCalendar />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Редирект */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;