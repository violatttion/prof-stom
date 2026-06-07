import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from './PageLayout';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { label: 'Календарь', path: '/admin/calendar' },
        { label: 'Пациенты', path: '/admin/patients' },
        { label: 'Услуги', path: '/admin/services' },
      ];
    }
    if (user.role === 'doctor') {
      return [
        { label: 'Дашборд', path: '/doctor' },
        { label: 'Пациенты', path: '/doctor/patients' },
        { label: 'Календарь', path: '/doctor/calendar' },
      ];
    }
    if (user.role === 'patient') {
      return [
        { label: 'Главная', path: '/patient' },
        { label: 'Мои записи', path: '/patient/appointments' },
        { label: 'Услуги', path: '/patient/services' },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ПРОФ СТОМ
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {navLinks.map(link => (
              <Button
                key={link.path}
                color="inherit"
                onClick={() => navigate(link.path)}
                sx={{ 
                  fontWeight: location.pathname === link.path ? 'bold' : 'normal',
                  borderBottom: location.pathname === link.path ? '2px solid white' : 'none'
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Button color="inherit" onClick={handleLogout} sx={{ ml: 3 }}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <PageLayout>
        {children}
      </PageLayout>
    </>
  );
};

export default MainLayout;