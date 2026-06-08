import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Grid, Card, CardContent, Button, TextField, Chip, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const PatientDashboard = () => {
  const [services, setServices] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [servicesRes, appointmentsRes] = await Promise.all([
        api.get('/services'),
        api.get('/appointments/my')
      ]);

      setServices(servicesRes.data || []);
      setMyAppointments(appointmentsRes.data || []);
    } catch (err) {
      console.error('Ошибка загрузки дашборда пациента:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBookService = (serviceId) => {
    navigate(`/patient/book?serviceId=${serviceId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Добро пожаловать в Проф Стом
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Мои записи */}
        <Grid item xs={12} md={7}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Мои записи</Typography>
            
            {myAppointments.length > 0 ? (
              myAppointments.slice(0, 6).map((app) => (
                <Card key={app.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography>
                      <strong>{app.appointment_date}</strong> в {app.appointment_time}
                    </Typography>
                    <Typography color="text.secondary">
                      {app.Doctor?.User?.full_name} — {app.Service?.name}
                    </Typography>
                    <Chip 
                      label={app.status} 
                      color={app.status === 'confirmed' ? 'success' : 'warning'} 
                      size="small" 
                      sx={{ mt: 1 }} 
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary">У вас пока нет записей</Typography>
            )}
          </Paper>
        </Grid>

        {/* Услуги клиники */}
        <Grid item xs={12} md={5}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Услуги клиники</Typography>

            <TextField
              label="Поиск услуги"
              fullWidth
              sx={{ mb: 2 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {filteredServices.length > 0 ? (
              filteredServices.slice(0, 8).map((service) => (
                <Card key={service.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">{service.name}</Typography>
                    <Typography color="primary" fontWeight="bold">
                      {service.price} ₽
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => handleBookService(service.id)}
                    >
                      Записаться
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography color="text.secondary">Услуги не найдены</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default PatientDashboard;