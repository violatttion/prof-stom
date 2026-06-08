import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';
import LeaveReview from '../../components/LeaveReview';
import api from '../../api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Состояние для диалога переноса
  const [openReschedule, setOpenReschedule] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data || []);
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

  // Открыть диалог переноса
  const openRescheduleDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.appointment_date);
    setNewTime(appointment.appointment_time);
    setOpenReschedule(true);
  };

  // Отправить запрос на перенос
  const handleRequestReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) return;

    setRescheduleLoading(true);
    setError('');

    try {
      await api.post(`/appointments/${selectedAppointment.id}/request-reschedule`, {
        new_date: newDate,
        new_time: newTime
      });

      setSuccess('Запрос на перенос отправлен администратору');
      setOpenReschedule(false);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отправке запроса');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setSuccess('Спасибо! Ваш отзыв отправлен.');
    fetchAppointments();
  };

  const getStatusColor = (status) => {
    if (status === 'confirmed') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'cancelled') return 'error';
    if (status === 'reschedule_requested') return 'info';
    return 'default';
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Мои записи
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

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
                  <TableCell>{app.Doctor?.User?.full_name || '—'}</TableCell>
                  <TableCell>{app.Service?.name || '—'}</TableCell>
                  <TableCell align="center">
                    <Chip label={app.status} color={getStatusColor(app.status)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {/* Кнопка отмены */}
                    {(app.status === 'pending' || app.status === 'confirmed') && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleCancel(app.id)}
                      >
                        Отменить
                      </Button>
                    )}

                    {/* Кнопка переноса записи */}
                    {(app.status === 'pending' || app.status === 'confirmed') && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => openRescheduleDialog(app)}
                      >
                        Перенести
                      </Button>
                    )}

                    {/* Кнопка оставить отзыв */}
                    {app.status === 'confirmed' && (
                      <LeaveReview 
                        appointment={app} 
                        onReviewSubmitted={handleReviewSubmitted} 
                      />
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

      {/* Диалог переноса записи */}
      <Dialog open={openReschedule} onClose={() => setOpenReschedule(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Перенести запись</DialogTitle>
        <DialogContent>
          <TextField
            label="Новая дата"
            type="date"
            fullWidth
            margin="normal"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Новое время"
            type="time"
            fullWidth
            margin="normal"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReschedule(false)}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleRequestReschedule}
            disabled={rescheduleLoading || !newDate || !newTime}
          >
            {rescheduleLoading ? 'Отправка...' : 'Отправить запрос'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyAppointments;