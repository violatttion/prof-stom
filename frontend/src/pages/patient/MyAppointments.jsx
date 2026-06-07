import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Alert
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      setError('Не удалось загрузить записи');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Отменить запись?')) return;

    try {
      await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      setSuccess('Запись отменена');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отмене');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'confirmed') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'cancelled') return 'error';
    return 'default';
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Мои записи
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Дата</strong></TableCell>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Врач</strong></TableCell>
              <TableCell><strong>Услуга</strong></TableCell>
              <TableCell align="center"><strong>Статус</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.appointment_date}</TableCell>
                  <TableCell>{app.appointment_time}</TableCell>
                  <TableCell>{app.Doctor?.User?.full_name}</TableCell>
                  <TableCell>{app.Service?.name}</TableCell>
                  <TableCell align="center">
                    <Chip label={app.status} color={getStatusColor(app.status)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {app.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancel(app.id)}
                      >
                        Отменить
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">Записей пока нет</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PageLayout>
  );
};

export default MyAppointments;