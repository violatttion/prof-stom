import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Box
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const PatientCard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // TODO: Здесь можно подключить jsPDF или html2pdf
    alert('Экспорт в PDF в разработке. Сейчас выводим в консоль.');
    console.log('Карта пациента:', patient);
    console.log('История приёмов:', appointments);
  };

  if (loading) return <PageLayout><Typography>Загрузка...</Typography></PageLayout>;
  if (error) return <PageLayout><Alert severity="error">{error}</Alert></PageLayout>;
  if (!patient) return <PageLayout><Typography>Пациент не найден</Typography></PageLayout>;

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
        Карта пациента
      </Typography>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{patient.full_name}</Typography>
            <Typography><strong>Телефон:</strong> {patient.User?.phone}</Typography>
            <Typography><strong>Email:</strong> {patient.User?.email}</Typography>
            <Typography><strong>Дата рождения:</strong> {patient.birth_date || '—'}</Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={exportToPDF} sx={{ mt: 2 }}>
              Экспорт карты в PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        История посещений
      </Typography>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Дата</strong></TableCell>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Услуга</strong></TableCell>
              <TableCell><strong>Статус</strong></TableCell>
              <TableCell><strong>Примечание</strong></TableCell>
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
                  <TableCell>{app.notes || '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">История посещений пуста</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PageLayout>
  );
};

export default PatientCard;