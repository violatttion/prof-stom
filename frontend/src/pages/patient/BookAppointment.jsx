import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, TextField, MenuItem, Alert, Box, CircularProgress
} from '@mui/material';
import api from '../../api';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');
  const preselectedDoctorId = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: preselectedDoctorId || '',
    service_id: preselectedServiceId || '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setInitialLoading(true);
    setError('');
    try {
      const [doctorsRes, servicesRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/services')
      ]);
      setDoctors(doctorsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error('Ошибка загрузки данных для записи:', err);
      setError('Не удалось загрузить список врачей и услуг');
    } finally {
      setInitialLoading(false);
    }
  };

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
        doctor_id: formData.doctor_id,
        service_ids: formData.service_id ? [formData.service_id] : [],
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        notes: formData.notes
      });
      setSuccess('Запись успешно создана! Мы свяжемся с вами для подтверждения.');
      setFormData({
        doctor_id: preselectedDoctorId || '',
        service_id: preselectedServiceId || '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании записи');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4, textAlign: 'center' }}>
        Записаться на приём
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 600, width: '100%' }}>
          <Box component="form" onSubmit={handleSubmit}>
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
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.User?.full_name} — {doctor.specialization || 'Стоматолог'}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Врачи не найдены</MenuItem>
              )}
            </TextField>

            <TextField
              select
              name="service_id"
              label="Услуга"
              fullWidth
              margin="normal"
              value={formData.service_id}
              onChange={handleChange}
              required
            >
              {services.length > 0 ? (
                services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name} — {service.price} ₽
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Услуги не найдены</MenuItem>
              )}
            </TextField>

            <TextField 
              name="appointment_date" 
              label="Дата" 
              type="date" 
              fullWidth 
              margin="normal" 
              value={formData.appointment_date} 
              onChange={handleChange} 
              required 
              InputLabelProps={{ shrink: true }} 
            />
            <TextField 
              name="appointment_time" 
              label="Время" 
              type="time" 
              fullWidth 
              margin="normal" 
              value={formData.appointment_time} 
              onChange={handleChange} 
              required 
              InputLabelProps={{ shrink: true }} 
            />
            <TextField 
              name="notes" 
              label="Примечание (необязательно)" 
              fullWidth 
              margin="normal" 
              multiline 
              rows={3} 
              value={formData.notes} 
              onChange={handleChange} 
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth 
              sx={{ mt: 3, py: 1.5 }} 
              disabled={loading || !formData.doctor_id || !formData.service_id}
            >
              {loading ? 'Запись...' : 'Записаться на приём'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default BookAppointment;