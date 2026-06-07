import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';
import jsPDF from 'jspdf';

const PatientCard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [teeth, setTeeth] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [status, setStatus] = useState('');
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
      setAppointments(appointmentsRes.data || []);

      // Зубная формула — делаем безопасно, чтобы не ломало карту у админа
      try {
        const teethRes = await api.get(`/teeth-formula/patient/${id}`);
        setTeeth(teethRes.data || []);
      } catch (teethErr) {
        setTeeth([]);
        // не показываем ошибку зубов — это не критично для просмотра карты
      }
    } catch (err) {
      console.error(err);
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
    if (!selectedTooth) return;

    try {
      await api.put(`/teeth-formula/${selectedTooth.id}`, {
        status,
        comment
      });
      setSuccess('Зуб обновлён');
      setOpenDialog(false);
      fetchPatientData();
    } catch (err) {
      setError('Ошибка сохранения');
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
      doc.text(
        `${index + 1}. ${app.appointment_date} ${app.appointment_time} — ${app.Service?.name || ''}`,
        20,
        y
      );
      y += 10;
    });

    doc.save(`patient_${fullName}.pdf`);
  };

  if (error) {
    return (
      <PageLayout>
        <Alert severity="error">{error}</Alert>
      </PageLayout>
    );
  }

  if (!patient) {
    return (
      <PageLayout>
        <Typography>Загрузка данных пациента...</Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
        Карта пациента
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Основная информация */}
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">
              {patient.User?.full_name || patient.full_name}
            </Typography>
            <Typography><strong>Телефон:</strong> {patient.User?.phone || patient.phone || '—'}</Typography>
            <Typography><strong>Email:</strong> {patient.User?.email || patient.email || '—'}</Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button variant="contained" onClick={exportToPDF}>
              Экспорт в PDF
            </Button>
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
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.appointment_date}</TableCell>
                  <TableCell>{app.appointment_time}</TableCell>
                  <TableCell>{app.Service?.name}</TableCell>
                  <TableCell>{app.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">История посещений пуста</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Зубная формула (только для врача, у админа будет пусто или без ошибки) */}
      <Typography variant="h6" gutterBottom>Зубная формула</Typography>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        <Grid container spacing={1}>
          {teeth.length > 0 ? (
            teeth.map((tooth) => (
              <Grid item xs={2} sm={1.5} key={tooth.id}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleToothClick(tooth)}
                >
                  {tooth.tooth_number}
                </Button>
              </Grid>
            ))
          ) : (
            <Typography color="text.secondary">Зубная формула пока не заполнена</Typography>
          )}
        </Grid>
      </Paper>

      {/* Диалог редактирования зуба */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Зуб №{selectedTooth?.tooth_number}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Состояние"
            fullWidth
            margin="normal"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="healthy">Здоров</option>
            <option value="caries">Кариес</option>
            <option value="extracted">Удалён</option>
            <option value="implant">Имплант</option>
            <option value="crown">Коронка</option>
          </TextField>

          <TextField
            label="Комментарий"
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