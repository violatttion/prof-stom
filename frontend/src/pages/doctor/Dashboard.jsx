import React from 'react';
import { Typography, Paper, Grid, Box } from '@mui/material';
import PageLayout from '../../components/PageLayout';

const DoctorDashboard = () => {
  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Дашборд врача
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>Мои пациенты</Typography>
            <Typography color="text.secondary">
              Здесь будет список ваших пациентов
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>Записи на сегодня</Typography>
            <Typography color="text.secondary">
              Здесь будет календарь и записи
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default DoctorDashboard;