import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, TextField, Button, MenuItem, Alert, Box
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const CreateAppointment = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    service_id: '',
    notes: ''
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Загружаем данные при открытии страницы
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, servicesRes] = await Promise.all([
          api.get('/patients'),
          api.get('/doctors'),
          api.get('/services')
        ]);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        setError('Не удалось загрузить данные');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/appointments', {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        service_ids: formData.service_id ? [formData.service_id] : [],
        notes: formData.notes
      });

      setSuccess('Запись успешно создана!');
      // Очищаем форму
      setFormData({
        patient_id: '', doctor_id: '', appointment_date: '',
        appointment_time: '', service_id: '', notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании записи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Создать новую запись
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            select
            name="patient_id"
            label="Пациент"
            fullWidth
            margin="normal"
            value={formData.patient_id}
            onChange={handleChange}
            required
          >
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name="doctor_id"
            label="Врач"
            fullWidth
            margin="normal"
            value={formData.doctor_id}
            onChange={handleChange}
            required
          >
            {doctors.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.User?.full_name}</MenuItem>
            ))}
          </TextField>

          <TextField name="appointment_date" label="Дата" type="date" fullWidth margin="normal" value={formData.appointment_date} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
          <TextField name="appointment_time" label="Время" type="time" fullWidth margin="normal" value={formData.appointment_time} onChange={handleChange} required InputLabelProps={{ shrink: true }} />

          <TextField
            select
            name="service_id"
            label="Услуга"
            fullWidth
            margin="normal"
            value={formData.service_id}
            onChange={handleChange}
          >
            {services.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name} — {s.price} ₽</MenuItem>
            ))}
          </TextField>

          <TextField name="notes" label="Примечание" fullWidth margin="normal" multiline rows={3} value={formData.notes} onChange={handleChange} />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать запись'}
          </Button>
        </Box>
      </Paper>
    </PageLayout>
  );
};

export default CreateAppointment;