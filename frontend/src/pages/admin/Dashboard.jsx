import React from 'react';
import { Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>Панель администратора</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Календарь записей</Typography>
            <Button component={Link} to="/admin/calendar" variant="contained" sx={{ mt: 2 }}>
              Открыть календарь
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Управление пациентами</Typography>
            <Button component={Link} to="/admin/patients" variant="contained" sx={{ mt: 2 }}>
              Список пациентов
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Услуги клиники</Typography>
            <Button component={Link} to="/admin/services" variant="contained" sx={{ mt: 2 }}>
              Управление услугами
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminDashboard;
