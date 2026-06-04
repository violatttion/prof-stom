import React, { useState } from 'react';
import { 
  Typography, Paper, Stepper, Step, StepLabel, Button, Box, 
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import api from '../../api';

const steps = ['Выбор врача', 'Выбор услуги', 'Дата и время', 'Подтверждение'];

const BookAppointment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({ 
    doctor_id: '', 
    service_id: '', 
    appointment_date: '', 
    appointment_time: '' 
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      await api.post('/appointments', {
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        service_ids: formData.service_id ? [formData.service_id] : []
      });
      alert('Запись успешно создана!');
      setActiveStep(0);
      setFormData({ doctor_id: '', service_id: '', appointment_date: '', appointment_time: '' });
    } catch (e) {
      alert('Ошибка: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Онлайн-запись на приём</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <FormControl fullWidth>
          <InputLabel>Выберите врача</InputLabel>
          <Select value={formData.doctor_id} onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}>
            <MenuItem value="1">Иванов И.И. — Терапевт</MenuItem>
            <MenuItem value="2">Петрова А.С. — Ортопед</MenuItem>
          </Select>
        </FormControl>
      )}

      {activeStep === 1 && (
        <FormControl fullWidth>
          <InputLabel>Выберите услугу</InputLabel>
          <Select value={formData.service_id} onChange={(e) => setFormData({...formData, service_id: e.target.value})}>
            <MenuItem value="1">Консультация — 1500 ₽</MenuItem>
            <MenuItem value="2">Лечение кариеса — 4500 ₽</MenuItem>
            <MenuItem value="3">Профессиональная гигиена — 5500 ₽</MenuItem>
          </Select>
        </FormControl>
      )}

      {activeStep === 2 && (
        <Box>
          <input 
            type="date" 
            value={formData.appointment_date} 
            onChange={(e) => setFormData({...formData, appointment_date: e.target.value})} 
            style={{width: '100%', padding: 12, marginBottom: 16}} 
          />
          <input 
            type="time" 
            value={formData.appointment_time} 
            onChange={(e) => setFormData({...formData, appointment_time: e.target.value})} 
            style={{width: '100%', padding: 12}} 
          />
        </Box>
      )}

      {activeStep === 3 && (
        <Box>
          <Typography>Врач ID: {formData.doctor_id}</Typography>
          <Typography>Услуга ID: {formData.service_id}</Typography>
          <Typography>Дата: {formData.appointment_date} {formData.appointment_time}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Назад</Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit}>Подтвердить запись</Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>Далее</Button>
        )}
      </Box>
    </Paper>
  );
};

export default BookAppointment;