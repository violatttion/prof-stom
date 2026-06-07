import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Box
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';
import jsPDF from 'jspdf';

const statusColors = {
  healthy: 'success',
  caries: 'warning',
  filling: 'info',
  extracted: 'error',
  implant: 'secondary',
  crown: 'primary',
  root_canal: 'default'
};

const statusLabels = {
  healthy: 'Здоров',
  caries: 'Кариес',
  filling: 'Пломба',
  extracted: 'Удалён',
  implant: 'Имплант',
  crown: 'Коронка',
  root_canal: 'Лечение каналов'
};

const PatientCard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [teeth, setTeeth] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [status, setStatus] = useState('healthy');
  const [comment, setComment] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    setError('');
    try {
      const patientRes = await api.get(`/patients/${id}`);
      setPatient(patientRes.data);

      const appointmentsRes = await api.get(`/appointments?patientId=${id}`);
      const apps = appointmentsRes.data || [];
      setAppointments(apps);

      // Берём самый последний приём для зубной формулы
      if (apps.length > 0) {
        const latest = [...apps].sort((a, b) => 
          new Date(b.appointment_date) - new Date(a.appointment_date)
        )[0];
        
        setSelectedAppointmentId(latest.id);
        
        try {
          const teethRes = await api.get(`/teeth-formula/${latest.id}`);
          setTeeth(teethRes.data || []);
        } catch {
          setTeeth([]);
        }
      }
    } catch (err) {
      setError('Не удалось загрузить данные пациента');
    }
  };

  const handleToothClick = (tooth) => {
    setSelectedTooth(tooth);
    setStatus(tooth.status || 'healthy');
    setComment(tooth.comment || '');
    setOpenDialog(true);
  };

  const handleSaveTooth = async () => {
    if (!selectedTooth || !selectedAppointmentId) return;

    try {
      await api.put(`/teeth-formula/${selectedAppointmentId}`, {
        tooth_number: selectedTooth.tooth_number,
        status,
        comment
      });
      setSuccess('Изменения сохранены');
      setOpenDialog(false);
      fetchPatientData(); // обновляем формулу
    } catch (err) {
      setError('Ошибка сохранения зубной формулы');
    }
  };

  const exportToPDF = () => {
    if (!patient) return;
    const fullName = patient.User?.full_name || patient.full_name || 'Пациент';
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Карта пациента', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`ФИО: ${fullName}`, 20, 40);
    doc.text(`Телефон: ${patient.User?.phone || patient.phone || '—'}`, 20, 50);
    doc.text(`Email: ${patient.User?.email || patient.email || '—'}`, 20, 60);

    let y = 80;
    doc.text('История посещений:', 20, y);
    y += 10;
    appointments.forEach((app, index) => {
      doc.text(`${index + 1}. ${app.appointment_date} ${app.appointment_time} — ${app.Service?.name || ''}`, 20, y);
      y += 10;
    });
    doc.save(`patient_${fullName}.pdf`);
  };

  if (error) {
    return <PageLayout><Alert severity="error">{error}</Alert></PageLayout>;
  }
  if (!patient) {
    return <PageLayout><Typography>Загрузка...</Typography></PageLayout>;
  }

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
        Карта пациента
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Основная информация */}
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">{patient.User?.full_name || patient.full_name}</Typography>
            <Typography><strong>Телефон:</strong> {patient.User?.phone || patient.phone || '—'}</Typography>
            <Typography><strong>Email:</strong> {patient.User?.email || patient.email || '—'}</Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button variant="contained" onClick={exportToPDF}>Экспорт в PDF</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* История посещений */}
      <Typography variant="h6" gutterBottom>История посещений</Typography>
      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Дата</strong></TableCell>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Услуга</strong></TableCell>
              <TableCell><strong>Статус</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length > 0 ? appointments.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.appointment_date}</TableCell>
                <TableCell>{app.appointment_time}</TableCell>
                <TableCell>{app.Service?.name}</TableCell>
                <TableCell>{app.status}</TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={4} align="center">История посещений пуста</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Зубная формула (рабочая версия) */}
      <Typography variant="h6" gutterBottom>
        Зубная формула {selectedAppointmentId && `(приём от ${appointments.find(a => a.id === selectedAppointmentId)?.appointment_date || ''})`}
      </Typography>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        {teeth.length > 0 ? (
          <Grid container spacing={1}>
            {teeth.map((tooth) => (
              <Grid item xs={2} sm={1.5} key={tooth.id}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleToothClick(tooth)}
                  sx={{
                    minHeight: 60,
                    borderColor: statusColors[tooth.status] === 'success' ? '#4caf50' : 
                                 statusColors[tooth.status] === 'error' ? '#f44336' : '#1976d2',
                    color: statusColors[tooth.status] === 'success' ? '#2e7d32' : 
                           statusColors[tooth.status] === 'error' ? '#c62828' : '#1565c0',
                    fontWeight: 600
                  }}
                >
                  {tooth.tooth_number}
                  {tooth.status && tooth.status !== 'healthy' && (
                    <Chip 
                      label={statusLabels[tooth.status] || tooth.status} 
                      color={statusColors[tooth.status]} 
                      size="small" 
                      sx={{ ml: 0.5, fontSize: '0.65rem' }}
                    />
                  )}
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              Зубная формула для этого пациента ещё не заполнена
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Нажмите на зуб в сетке выше, чтобы начать заполнение (формула привязана к последнему приёму)
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Модальное окно редактирования зуба */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Зуб №{selectedTooth?.tooth_number}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Состояние"
            fullWidth
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="healthy">Здоров</option>
            <option value="caries">Кариес</option>
            <option value="filling">Пломба</option>
            <option value="extracted">Удалён</option>
            <option value="implant">Имплант</option>
            <option value="crown">Коронка</option>
            <option value="root_canal">Лечение каналов</option>
          </TextField>

          <TextField
            label="Комментарий врача"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveTooth}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default PatientCard;