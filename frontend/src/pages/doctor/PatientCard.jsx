import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';
import jsPDF from 'jspdf';

const PatientCard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const [patientRes, appointmentsRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/appointments?patientId=${id}`)
      ]);
      setPatient(patientRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      setError('Не удалось загрузить данные пациента');
    }
  };

  const exportToPDF = () => {
    if (!patient) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Карта пациента', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`ФИО: ${patient.full_name}`, 20, 40);
    doc.text(`Телефон: ${patient.User?.phone || '—'}`, 20, 50);
    doc.text(`Email: ${patient.User?.email || '—'}`, 20, 60);
    doc.text(`Дата рождения: ${patient.birth_date || '—'}`, 20, 70);

    doc.text('История посещений:', 20, 90);

    let y = 100;
    appointments.forEach((app, index) => {
      doc.text(`${index + 1}. ${app.appointment_date} ${app.appointment_time} — ${app.Service?.name || ''}`, 20, y);
      y += 10;
    });

    doc.save(`patient_${patient.full_name}.pdf`);
  };

  if (error) return <PageLayout><Alert severity="error">{error}</Alert></PageLayout>;
  if (!patient) return <PageLayout><Typography>Загрузка...</Typography></PageLayout>;

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
        Карта пациента
      </Typography>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">{patient.full_name}</Typography>
            <Typography><strong>Телефон:</strong> {patient.User?.phone || '—'}</Typography>
            <Typography><strong>Email:</strong> {patient.User?.email || '—'}</Typography>
            <Typography><strong>Дата рождения:</strong> {patient.birth_date || '—'}</Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button variant="contained" onClick={exportToPDF} sx={{ mt: { xs: 2, md: 0 } }}>
              Экспорт в PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>История посещений</Typography>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
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
    </PageLayout>
  );
};

export default PatientCard;