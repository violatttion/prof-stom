import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Alert, Chip, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const AdminCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

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

  // Изменение статуса
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      setSuccess(`Статус изменён на "${newStatus}"`);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при изменении статуса');
    }
  };

  // Открыть диалог переноса
  const openRescheduleDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.appointment_date);
    setNewTime(appointment.appointment_time);
    setOpenDialog(true);
  };

  // Перенос записи
  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) return;

    try {
      await api.put(`/appointments/${selectedAppointment.id}/reschedule`, {
        newDate,
        newTime
      });
      setSuccess('Запись успешно перенесена');
      setOpenDialog(false);
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
                <TableRow key={app.id}>
                  <TableCell>{app.appointment_date}</TableCell>
                  <TableCell>{app.appointment_time}</TableCell>
                  <TableCell>{app.Patient?.User?.full_name}</TableCell>
                  <TableCell>{app.Doctor?.User?.full_name}</TableCell>
                  <TableCell>{app.Service?.name}</TableCell>
                  <TableCell align="center">
                    <Chip label={app.status} color={getStatusColor(app.status)} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => openRescheduleDialog(app)}
                    >
                      Перенести
                    </Button>
                    {app.status === 'pending' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
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
                        sx={{ ml: 1 }}
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

      {/* Диалог переноса записи */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleReschedule}>
            Перенести
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default AdminCalendar;