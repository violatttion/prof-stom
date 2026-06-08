import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Grid, Card, CardContent, Button, Box, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  });
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStats();
    fetchRescheduleRequests();
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

  const fetchRescheduleRequests = async () => {
    try {
      const res = await api.get('/appointments?status=reschedule_requested');
      setRescheduleRequests(res.data || []);
    } catch (err) {
      console.error('Ошибка загрузки запросов на перенос:', err);
    }
  };

  const handleRescheduleAction = async (id, action) => {
    try {
      await api.patch(`/appointments/${id}/handle-reschedule`, { action });
      setSuccess(`Запрос ${action === 'approve' ? 'одобрен' : 'отклонён'}`);
      fetchRescheduleRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при обработке запроса');
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Панель администратора
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

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

        {/* Запросы на перенос записи */}
        <Grid item xs={12}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Запросы на перенос записи ({rescheduleRequests.length})
            </Typography>

            {rescheduleRequests.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Пациент</strong></TableCell>
                      <TableCell><strong>Текущая дата / время</strong></TableCell>
                      <TableCell><strong>Новая дата / время</strong></TableCell>
                      <TableCell align="center"><strong>Действия</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rescheduleRequests.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.Patient?.User?.full_name || '—'}</TableCell>
                        <TableCell>
                          {app.appointment_date} / {app.appointment_time}
                        </TableCell>
                        <TableCell>
                          {app.reschedule_date} / {app.reschedule_time}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => handleRescheduleAction(app.id, 'approve')}
                          >
                            Одобрить
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRescheduleAction(app.id, 'reject')}
                          >
                            Отклонить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">Запросов на перенос пока нет</Typography>
            )}
          </Paper>
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
                  to="/admin/staff"
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ py: 2 }}
                >
                  Управление сотрудниками
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AdminDashboard;