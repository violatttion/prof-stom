import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Button
} from '@mui/material';
import {
  Dashboard, People, CalendarMonth, MedicalServices, Logout, Person
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { text: 'Дашборд', icon: <Dashboard />, path: '/admin' },
        { text: 'Календарь', icon: <CalendarMonth />, path: '/admin/calendar' },
        { text: 'Пациенты', icon: <People />, path: '/admin/patients' },
        { text: 'Услуги', icon: <MedicalServices />, path: '/admin/services' },
      ];
    } 
    else if (user?.role === 'doctor') {
      return [
        { text: 'Дашборд', icon: <Dashboard />, path: '/doctor' },
        { text: 'Пациенты', icon: <People />, path: '/doctor/patients' },
      ];
    } 
    else {
      return [
        { text: 'Главная', icon: <Dashboard />, path: '/patient' },
        { text: 'Врачи', icon: <Person />, path: '/patient/doctors' },
        { text: 'Записаться', icon: <CalendarMonth />, path: '/patient/book' },
        { text: 'Мои записи', icon: <People />, path: '/patient/appointments' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Верхняя панель */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Проф Стом
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      {/* Боковое меню */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Основной контент */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;