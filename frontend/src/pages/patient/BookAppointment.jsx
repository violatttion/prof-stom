import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Typography, Paper, Grid, Button, TextField, MenuItem, Alert, Box
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import api from '../../api';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    service_id: preselectedServiceId || '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, servicesRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/services')
      ]);
      setDoctors(doctorsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      setError('Не удалось загрузить данные');
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
      setSuccess('Запись успешно создана!');
      setFormData({
        doctor_id: '', service_id: '', appointment_date: '', appointment_time: '', notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании записи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ color: '#fff', fontWeight: 700, mb: 4 }}
      >
        Записаться на приём
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Paper 
        elevation={4} 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          maxWidth: 600, 
          mx: 'auto' 
        }}
      >
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
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.User?.full_name} — {doctor.specialization}
              </MenuItem>
            ))}
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
            {services.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name} — {service.price} ₽
              </MenuItem>
            ))}
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
            label="Примечание"
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
            disabled={loading}
          >
            {loading ? 'Запись...' : 'Записаться'}
          </Button>
        </Box>
      </Paper>
    </PageLayout>
  );
};

export default BookAppointment;