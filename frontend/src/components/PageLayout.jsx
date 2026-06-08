import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';

const PageLayout = ({ children }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user, logout } = useAuth();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'patient';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#0d47a1' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 600 }}
            onClick={() => navigate('/')}
          >
            ProfStom
          </Typography>

          {/* Десктопное меню */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
            {role === 'patient' && (
              <>
                <Button color="inherit" onClick={() => navigate('/patient/dashboard')}>
                  Главная
                </Button>
                <Button color="inherit" onClick={() => navigate('/patient/doctors')}>
                  Врачи
                </Button>
                <Button color="inherit" onClick={() => navigate('/patient/book')}>
                  Записаться
                </Button>
                <Button color="inherit" onClick={() => navigate('/patient/appointments')}>
                  Мои записи
                </Button>
              </>
            )}

            {role === 'doctor' && (
              <>
                <Button color="inherit" onClick={() => navigate('/doctor/dashboard')}>
                  Дашборд
                </Button>
                <Button color="inherit" onClick={() => navigate('/doctor/patients')}>
                  Пациенты
                </Button>
              </>
            )}

            {role === 'admin' && (
              <>
                <Button color="inherit" onClick={() => navigate('/admin/dashboard')}>
                  Дашборд
                </Button>
                <Button color="inherit" onClick={() => navigate('/admin/patients')}>
                  Пациенты
                </Button>
                <Button color="inherit" onClick={() => navigate('/admin/calendar')}>
                  Календарь
                </Button>
                <Button color="inherit" onClick={() => navigate('/admin/services')}>
                  Услуги
                </Button>
              </>
            )}
          </Box>

          {/* Мобильное меню */}
          <IconButton
            color="inherit"
            onClick={handleMenu}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            {role === 'patient' && (
              <>
                <MenuItem onClick={() => { navigate('/patient/dashboard'); handleClose(); }}>Главная</MenuItem>
                <MenuItem onClick={() => { navigate('/patient/doctors'); handleClose(); }}>Врачи</MenuItem>
                <MenuItem onClick={() => { navigate('/patient/book'); handleClose(); }}>Записаться</MenuItem>
                <MenuItem onClick={() => { navigate('/patient/appointments'); handleClose(); }}>Мои записи</MenuItem>
              </>
            )}
            <MenuItem onClick={handleLogout}>Выйти</MenuItem>
          </Menu>

          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ ml: 2, display: { xs: 'none', md: 'inline-flex' } }}
          >
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;