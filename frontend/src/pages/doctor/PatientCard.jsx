import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Collapse
} from '@mui/material';
import api from '../../api';
import jsPDF from 'jspdf';

const translit = (text) => {
  if (!text) return '';
  const map = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'E','Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Sch','Э':'E','Ю':'Yu','Я':'Ya' };
  return text.split('').map(char => map[char] || char).join('');
};

const toothLabelToNumber = {
  '8+': 81, '7+': 71, '6+': 61, '5+': 51, '4+': 41, '3+': 31, '2+': 21, '1+': 11,
  '1-': 12, '2-': 22, '3-': 32, '4-': 42, '5-': 52, '6-': 62, '7-': 72, '8-': 82
};

const numberToToothLabel = Object.fromEntries(
  Object.entries(toothLabelToNumber).map(([label, num]) => [num, label])
);

const PatientCard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [teeth, setTeeth] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [status, setStatus] = useState('healthy');
  const [comment, setComment] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFormula, setShowFormula] = useState(false);

  const upperRight = ['8+', '7+', '6+', '5+', '4+', '3+', '2+', '1+'];
  const upperLeft  = ['1+', '2+', '3+', '4+', '5+', '6+', '7+', '8+'];
  const lowerRight = ['8-', '7-', '6-', '5-', '4-', '3-', '2-', '1-'];
  const lowerLeft  = ['1-', '2-', '3-', '4-', '5-', '6-', '7-', '8-'];

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const patientRes = await api.get(`/patients/${id}`);
      setPatient(patientRes.data);

      const appointmentsRes = await api.get(`/appointments?patientId=${id}`);
      const sorted = [...(appointmentsRes.data || [])].sort((a, b) =>
        new Date(b.appointment_date) - new Date(a.appointment_date)
      );
      setAppointments(sorted);

      if (sorted.length > 0) {
        const latestId = sorted[0].id;
        const teethRes = await api.get(`/teeth-formula/${latestId}`);
        setTeeth(teethRes.data || []);
      }
    } catch (err) {
      setError('Не удалось загрузить данные пациента');
    }
  };

  const getToothData = (label) => {
    const number = toothLabelToNumber[label];
    return teeth.find(t => t.tooth_number === number) || { tooth_number: number, status: 'healthy', comment: '' };
  };

  const handleToothClick = (label) => {
    if (appointments.length === 0) return;
    const toothData = getToothData(label);
    setSelectedTooth({ ...toothData, displayLabel: label });
    setStatus(toothData.status || 'healthy');
    setComment(toothData.comment || '');
    setOpenDialog(true);
  };

  const handleSaveTooth = async () => {
    if (!selectedTooth || appointments.length === 0) return;
    const latestId = appointments[0].id;

    try {
      await api.put(`/teeth-formula/${latestId}`, {
        tooth_number: selectedTooth.tooth_number,
        status,
        comment
      });
      setSuccess('Зуб сохранён');
      setOpenDialog(false);
      fetchPatientData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const exportToPDF = () => {
    if (!patient) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('PATIENT MEDICAL CARD', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Full Name: ${translit(patient.User?.full_name || patient.full_name)}`, 20, 35);
    doc.text(`Phone: ${patient.User?.phone || patient.phone || '—'}`, 20, 43);
    doc.text(`Email: ${patient.User?.email || patient.email || '—'}`, 20, 51);

    let y = 65;
    doc.text('Appointment History:', 20, y);
    y += 10;
    appointments.forEach((app, index) => {
      doc.text(`${index + 1}. ${app.appointment_date} | ${app.appointment_time} | ${translit(app.Service?.name || '—')}`, 20, y);
      y += 8;
    });

    y += 10;
    doc.text('Dental Formula (Latest Visit):', 20, y);
    y += 10;

    teeth.forEach((tooth) => {
      const label = numberToToothLabel[tooth.tooth_number] || tooth.tooth_number;
      if (tooth.status && tooth.status !== 'healthy') {
        doc.text(`Tooth ${label}: ${tooth.status} ${tooth.comment ? '- ' + translit(tooth.comment) : ''}`, 20, y);
        y += 8;
      }
    });

    const fileName = translit(patient.User?.full_name || patient.full_name || 'patient').replace(/\s+/g, '_');
    doc.save(`Patient_Card_${fileName}.pdf`);
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!patient) return <Typography>Загрузка...</Typography>;

  return (
    <>
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

      <Typography variant="h6" gutterBottom>История приёмов</Typography>
      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Дата</strong></TableCell>
              <TableCell><strong>Время</strong></TableCell>
              <TableCell><strong>Услуга</strong></TableCell>
              <TableCell><strong>Статус</strong></TableCell>
              <TableCell align="center"><strong>Действия</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.appointment_date}</TableCell>
                  <TableCell>{app.appointment_time}</TableCell>
                  <TableCell>{app.Service?.name || '—'}</TableCell>
                  <TableCell>{app.status}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={async () => {
                        if (!window.confirm('Удалить этот приём из истории?')) return;
                        try {
                          await api.delete(`/appointments/${app.id}`);
                          setSuccess('Приём удалён');
                          fetchPatientData();
                        } catch (err) {
                          setError('Ошибка при удалении приёма');
                        }
                      }}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">Записей пока нет</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box>
        <Button variant="contained" onClick={() => setShowFormula(!showFormula)} sx={{ mb: 2 }}>
          {showFormula ? 'Скрыть зубную формулу' : 'Показать зубную формулу'}
        </Button>

        <Collapse in={showFormula}>
          <Typography variant="h6" gutterBottom>Зубная формула</Typography>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1565c0', textAlign: 'center' }}>Верхняя челюсть</Typography>

            <Grid container spacing={0.5} sx={{ mb: 2 }}>
              {upperRight.map((label) => {
                const tooth = getToothData(label);
                return (
                  <Grid item xs={1.5} key={label}>
                    <Button variant="outlined" fullWidth onClick={() => handleToothClick(label)} sx={{ minHeight: 52 }}>
                      {label}
                      {tooth.status && tooth.status !== 'healthy' && <Chip label={tooth.status} size="small" sx={{ ml: 0.5 }} />}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            <Grid container spacing={0.5} sx={{ mb: 3 }}>
              {upperLeft.map((label) => {
                const tooth = getToothData(label);
                return (
                  <Grid item xs={1.5} key={label}>
                    <Button variant="outlined" fullWidth onClick={() => handleToothClick(label)} sx={{ minHeight: 52 }}>
                      {label}
                      {tooth.status && tooth.status !== 'healthy' && <Chip label={tooth.status} size="small" sx={{ ml: 0.5 }} />}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1565c0', textAlign: 'center' }}>Нижняя челюсть</Typography>

            <Grid container spacing={0.5}>
              {lowerRight.map((label) => {
                const tooth = getToothData(label);
                return (
                  <Grid item xs={1.5} key={label}>
                    <Button variant="outlined" fullWidth onClick={() => handleToothClick(label)} sx={{ minHeight: 52 }}>
                      {label}
                      {tooth.status && tooth.status !== 'healthy' && <Chip label={tooth.status} size="small" sx={{ ml: 0.5 }} />}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            <Grid container spacing={0.5}>
              {lowerLeft.map((label) => {
                const tooth = getToothData(label);
                return (
                  <Grid item xs={1.5} key={label}>
                    <Button variant="outlined" fullWidth onClick={() => handleToothClick(label)} sx={{ minHeight: 52 }}>
                      {label}
                      {tooth.status && tooth.status !== 'healthy' && <Chip label={tooth.status} size="small" sx={{ ml: 0.5 }} />}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Collapse>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Зуб {selectedTooth?.displayLabel}</DialogTitle>
        <DialogContent>
          <TextField select label="Состояние" fullWidth margin="normal" value={status} onChange={(e) => setStatus(e.target.value)} SelectProps={{ native: true }}>
            <option value="healthy">Здоров</option>
            <option value="caries">Кариес</option>
            <option value="filling">Пломба</option>
            <option value="extracted">Удалён</option>
            <option value="implant">Имплант</option>
            <option value="crown">Коронка</option>
          </TextField>
          <TextField label="Комментарий" fullWidth margin="normal" multiline rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSaveTooth}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PatientCard;