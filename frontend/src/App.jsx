import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminCalendar from './pages/admin/Calendar';
import AdminPatients from './pages/admin/Patients';
import AdminServices from './pages/admin/Services';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import PatientCard from './pages/doctor/PatientCard';
import TeethFormula from './pages/doctor/TeethFormula';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/services" element={<AdminServices />} />

          {/* Doctor */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/patient/:id" element={<PatientCard />} />
          <Route path="/doctor/teeth/:appointmentId" element={<TeethFormula />} />

          {/* Patient */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/book" element={<BookAppointment />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
        </Route>
      </Route>

      <Route 
        path="/" 
        element={
          user 
            ? (user.role === 'admin' ? <Navigate to="/admin" /> : 
               user.role === 'doctor' ? <Navigate to="/doctor" /> : 
               <Navigate to="/patient" />)
            : <Navigate to="/login" />
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
