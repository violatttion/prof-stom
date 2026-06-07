import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Box
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';
import jsPDF from 'jspdf';

// Транслитерация русского текста для PDF
const translit = (text) => {
  if (!text) return '';
  const map = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i',
    'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
    'у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'',
    'э':'e','ю':'yu','я':'ya','А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'E',
    'Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P',
    'Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Sch',
    'Э':'E','Ю':'Yu','Я':'Ya'
  };
  return text.split('').map(char => map[char] || char).join('');
};

// Статусы на английском для PDF (чтобы не было кракозябр)
const pdfStatusLabels = {
  healthy: 'Healthy',
  caries: 'Caries',
  filling: 'Filling',
  extracted: 'Extracted',
  implant: 'Implant',
  crown: 'Crown',
  root_canal: 'Root Canal Treatment'
};

const PatientCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const allTeethNumbers = Array.from({ length: 32 }, (_, i) => i + 1);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    setError('');
    try {
      const patientRes = await api.get(`/patients/${id}`);
      setPatient(patientRes.data);

      const appointmentsRes = await api.get(`/appointments?patientId=${id}`);
      const sortedApps = (appointmentsRes.data || []).sort((a, b) =>
        new Date(b.appointment_date) - new Date(a.appointment_date) ||
        b.appointment_time.localeCompare(a.appointment_time)
      );
      setAppointments(sortedApps);

      if (sortedApps.length > 0) {
        const latestId = sortedApps[0].id;
        setSelectedAppointmentId(latestId);
        await loadTeethForAppointment(latestId);
      }
    } catch (err) {
      setError('Не удалось загрузить данные пациента');
    }
  };

  const loadTeethForAppointment = async (appointmentId) => {
    try {
      const teethRes = await api.get(`/teeth-formula/${appointmentId}`);
      setTeeth(teethRes.data || []);
    } catch {
      setTeeth([]);
    }
  };

  const handleSelectAppointment = async (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    await loadTeethForAppointment(appointmentId);
  };

  const getToothData = (number) => {
    return teeth.find(t => t.tooth_number === number) || { tooth_number: number, status: 'healthy', comment: '' };
  };

  const handleToothClick = (number) => {
    const toothData = getToothData(number);
    setSelectedTooth(toothData);
    setStatus(toothData.status || 'healthy');
    setComment(toothData.comment || '');
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
      setSuccess('Зуб сохранён');
      setOpenDialog(false);
      await loadTeethForAppointment(selectedAppointmentId);
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  // ==================== КРАСИВЫЙ И ЧИСТЫЙ PDF ====================
  const exportToPDF = () => {
    if (!patient) return;

    const fullName = patient.User?.full_name || patient.full_name || 'Patient';
    const phone = patient.User?.phone || patient.phone || '—';
    const email = patient.User?.email || patient.email || '—';

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Заголовок
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT MEDICAL CARD", 105, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString('ru-RU')}`, 105, 25, { align: 'center' });

    // Информация о пациенте (с транслитом)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", 20, 38);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Full Name: ${translit(fullName)}`, 20, 46);
    doc.text(`Phone: ${phone}`, 20, 52);
    doc.text(`Email: ${email}`, 20, 58);

    // История приёмов
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Appointment History", 20, 70);

    let y = 78;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (appointments.length > 0) {
      appointments.forEach((app, index) => {
        const service = translit(app.Service?.name || app.Services?.[0]?.name || '—');
        doc.text(`${index + 1}. ${app.appointment_date}  |  ${app.appointment_time}  |  ${service}  |  ${app.status}`, 20, y);
        y += 6;
      });
    } else {
      doc.text("No appointments found.", 20, y);
    }

    // Зубная формула (только проблемные зубы, статусы на английском)
    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Dental Formula Status", 20, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const problemTeeth = teeth.filter(t => t.status && t.status !== 'healthy');

    if (problemTeeth.length > 0) {
      problemTeeth.forEach((tooth) => {
        const statusEn = pdfStatusLabels[tooth.status] || tooth.status;
        const commentText = tooth.comment ? ` - ${translit(tooth.comment)}` : '';
        doc.text(`Tooth #${tooth.tooth_number}: ${statusEn}${commentText}`, 20, y);
        y += 6;
      });
    } else {
      doc.text("All teeth are marked as healthy or no data available.", 20, y);
    }

    // Сохраняем файл по ФИО
    const safeFileName = translit(fullName).replace(/\s+/g, '_') || 'patient_card';
    doc.save(`Patient_Card_${safeFileName}.pdf`);
  };

  if (error) return <PageLayout><Alert severity="error">{error}</Alert></PageLayout>;
  if (!patient) return <PageLayout><Typography>Загрузка...</Typography></PageLayout>;

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700 }}>
        Карта пациента
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

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

      {/* История приёмов */}
      <Typography variant="h6" gutterBottom>История приёмов</Typography>
      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Дата</strong></TableCell>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Услуга</strong></TableCell>
              <TableCell><strong>Статус</strong></TableCell>
              <TableCell align="center"><strong>Зубная формула</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length > 0 ? appointments.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.appointment_date}</TableCell>
                <TableCell>{app.appointment_time}</TableCell>
                <TableCell>{app.Service?.name || app.Services?.[0]?.name || '—'}</TableCell>
                <TableCell>{app.status}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" onClick={() => handleSelectAppointment(app.id)}>
                    Открыть формулу
                  </Button>
                </TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={5} align="center">Приёмов пока нет</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Зубная формула */}
      <Typography variant="h6" gutterBottom>Зубная формула (все 32 зуба)</Typography>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={1}>
          {allTeethNumbers.map((num) => {
            const tooth = getToothData(num);
            return (
              <Grid item xs={2} sm={1.5} key={num}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleToothClick(num)}
                  sx={{ minHeight: 58, fontWeight: 600 }}
                >
                  {num}
                  {tooth.status && tooth.status !== 'healthy' && (
                    <Chip label={tooth.status} color="primary" size="small" sx={{ ml: 0.5, fontSize: '0.6rem' }} />
                  )}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Модалка редактирования зуба */}
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
          <TextField label="Комментарий" fullWidth margin="normal" multiline rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
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