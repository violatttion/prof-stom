import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const DoctorDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        api.get('/appointments/my'),
        api.get('/patients')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayApps = appointmentsRes.data.filter(app => app.appointment_date === today);

      setTodayAppointments(todayApps);
      setPatients(patientsRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.User?.phone?.includes(search)
  );

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Дашборд врача
      </Typography>

      <Grid container spacing={3}>
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
                      <TableRow key={app.id}>
                        <TableCell>{app.appointment_time}</TableCell>
                        <TableCell>{app.Patient?.User?.full_name}</TableCell>
                        <TableCell>{app.Service?.name}</TableCell>
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

        <Grid item xs={12} md={5}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Мои пациенты</Typography>
            <TextField
              label="Поиск"
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
                  {filteredPatients.slice(0, 10).map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>{patient.full_name}</TableCell>
                      <TableCell>{patient.User?.phone || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default DoctorDashboard;