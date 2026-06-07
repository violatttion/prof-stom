import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Alert, Box, Chip
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const AdminCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      setError('Не удалось загрузить записи');
    }
  };

  // Изменение статуса записи
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setSuccess(`Статус изменён на "${newStatus}"`);
      setError('');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при изменении статуса');
    }
  };

  // Перетаскивание записи
  const handleDragStart = (e, appointmentId) => {
    e.dataTransfer.setData('appointmentId', appointmentId);
    setError('');
    setSuccess('');
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, newDate, newTime) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData('appointmentId');

    try {
      await api.put(`/appointments/${appointmentId}/reschedule`, {
        newDate,
        newTime
      });
      setSuccess('Запись успешно перенесена');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при переносе');
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
        Календарь записей
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Дата</strong></TableCell>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Пациент</strong></TableCell>
              <TableCell><strong>Врач</strong></TableCell>
              <TableCell><strong>Услуга</strong></TableCell>
              <TableCell align="center"><strong>Статус</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <TableRow
                  key={app.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, '2026-06-10', '15:00')}
                  sx={{ cursor: 'grab' }}
                >
                  <TableCell>{app.appointment_date}</TableCell>
                  <TableCell>{app.appointment_time}</TableCell>
                  <TableCell>{app.Patient?.User?.full_name}</TableCell>
                  <TableCell>{app.Doctor?.User?.full_name}</TableCell>
                  <TableCell>{app.Service?.name}</TableCell>
                  <TableCell align="center">
                    <Chip label={app.status} color={getStatusColor(app.status)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {app.status === 'pending' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleStatusChange(app.id, 'confirmed')}
                      >
                        Подтвердить
                      </Button>
                    )}
                    {app.status !== 'cancelled' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleStatusChange(app.id, 'cancelled')}
                      >
                        Отменить
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">Записей пока нет</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PageLayout>
  );
};

export default AdminCalendar;