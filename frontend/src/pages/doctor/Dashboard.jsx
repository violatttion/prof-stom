import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Alert, CircularProgress, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        api.get('/appointments/my'),
        api.get('/patients')
      ]);

      // Исправлено: используем локальную дату (а не UTC)
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');

      const todayApps = (appointmentsRes.data || []).filter(app => 
        app.appointment_date === todayStr
      );

      setTodayAppointments(todayApps);
      setPatients(patientsRes.data || []);
    } catch (err) {
      console.error('Ошибка загрузки дашборда врача:', err);
      setError('Не удалось загрузить данные дашборда');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const fullName = p.User?.full_name || p.full_name || '';
    const phone = p.User?.phone || p.phone || '';
    const s = search.toLowerCase();
    return fullName.toLowerCase().includes(s) ||
           phone.toLowerCase().includes(s);
  });

  // Клик по записи на сегодня → открываем карту пациента
  const handleAppointmentClick = (patientId) => {
    if (patientId) {
      navigate(`/doctor/patient/${patientId}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Дашборд врача
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Записи на сегодня */}
        <Grid item xs={12} md={7}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Записи на сегодня</Typography>
            {todayAppointments.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Время</strong></TableCell>
                      <TableCell><strong>Пациент</strong></TableCell>
                      <TableCell><strong>Услуга</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayAppointments.map((app) => (
                      <TableRow 
                        key={app.id} 
                        hover 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleAppointmentClick(app.patient_id || app.Patient?.id)}
                      >
                        <TableCell>{app.appointment_time}</TableCell>
                        <TableCell>{app.Patient?.User?.full_name || '—'}</TableCell>
                        <TableCell>{app.Service?.name || app.Services?.[0]?.name || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">На сегодня записей нет</Typography>
            )}
          </Paper>
        </Grid>

        {/* Мои пациенты + быстрый поиск */}
        <Grid item xs={12} md={5}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Мои пациенты</Typography>

            <TextField
              label="Поиск по ФИО или телефону"
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <TableContainer sx={{ maxHeight: 280 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ФИО</strong></TableCell>
                    <TableCell><strong>Телефон</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.slice(0, 10).map((patient) => (
                      <TableRow 
                        key={patient.id} 
                        hover 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                      >
                        <TableCell>{patient.User?.full_name || patient.full_name || '—'}</TableCell>
                        <TableCell>{patient.User?.phone || patient.phone || '—'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center" color="text.secondary">
                        Пациенты не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DoctorDashboard;