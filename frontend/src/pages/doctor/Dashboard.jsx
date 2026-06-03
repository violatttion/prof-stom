import React from 'react';
import { Typography, Paper, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => (
  <div>
    <Typography variant="h4" gutterBottom>Панель врача</Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Мои пациенты</Typography>
          <Button component={Link} to="/doctor/patients" variant="contained" sx={{ mt: 2 }}>
            Открыть список
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Сегодняшнее расписание</Typography>
          <Typography sx={{ mt: 1 }}>Перейдите в раздел «Пациенты» для просмотра записей.</Typography>
        </Paper>
      </Grid>
    </Grid>
  </div>
);

export default DoctorDashboard;
