import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Grid, Card, CardContent, Button, Box
} from '@mui/material';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/appointments')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayApps = appointmentsRes.data.filter(a => a.appointment_date === today);
      const pending = appointmentsRes.data.filter(a => a.status === 'pending');

      setStats({
        totalPatients: patientsRes.data.length,
        totalDoctors: doctorsRes.data.length,
        todayAppointments: todayApps.length,
        pendingAppointments: pending.length
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Панель администратора
      </Typography>

      <Grid container spacing={3}>
        {/* Статистика */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h3" color="primary">{stats.totalPatients}</Typography>
              <Typography color="text.secondary">Пациентов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h3" color="primary">{stats.totalDoctors}</Typography>
              <Typography color="text.secondary">Врачей</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h3" color="primary">{stats.todayAppointments}</Typography>
              <Typography color="text.secondary">Записей сегодня</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h3" color="warning.main">{stats.pendingAppointments}</Typography>
              <Typography color="text.secondary">Ожидают подтверждения</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Быстрые действия */}
        <Grid item xs={12}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Быстрые действия</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/calendar"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                >
                  Перейти в Календарь
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/patients"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                >
                  Управление пациентами
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/services"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                >
                  Управление услугами
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/admin/calendar"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                >
                  Создать запись
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default AdminDashboard;