import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Divider 
} from '@mui/material';
import { 
  Dashboard, CalendarMonth, People, MedicalServices, 
  Logout 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PageLayout from './PageLayout';

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
    } else if (user?.role === 'doctor') {
      return [
        { text: 'Дашборд', icon: <Dashboard />, path: '/doctor' },
        { text: 'Пациенты', icon: <People />, path: '/doctor/patients' },
      ];
    } else {
      return [
        { text: 'Главная', icon: <Dashboard />, path: '/patient' },
        { text: 'Записаться', icon: <CalendarMonth />, path: '/patient/book' },
        { text: 'Мои записи', icon: <People />, path: '/patient/appointments' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ПРОФ СТОМ — {user?.role === 'admin' ? 'Администратор' : user?.role === 'doctor' ? 'Врач' : 'Пациент'}
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.full_name}</Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

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
                <ListItemButton component={Link} to={item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary="Выйти" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, mt: 8 }}>
        <PageLayout>
          <Outlet />
        </PageLayout>
      </Box>
    </Box>
  );
};

export default Layout;