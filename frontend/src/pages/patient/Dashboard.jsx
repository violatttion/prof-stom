import React from 'react';
import { Typography, Paper, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const PatientDashboard = () => (
  <div>
    <Typography variant="h4" gutterBottom>Личный кабинет пациента</Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Записаться на приём</Typography>
          <Button component={Link} to="/patient/book" variant="contained" sx={{ mt: 2 }}>
            Новая запись
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Мои записи</Typography>
          <Button component={Link} to="/patient/appointments" variant="contained" sx={{ mt: 2 }}>
            Посмотреть записи
          </Button>
        </Paper>
      </Grid>
    </Grid>
  </div>
);

export default PatientDashboard;
