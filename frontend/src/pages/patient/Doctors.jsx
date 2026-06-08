import React, { useState, useEffect } from 'react';
import {
  Typography, Grid, Card, CardContent, CardActions,
  Button, TextField, CircularProgress
} from '@mui/material';
import api from '../../api';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const fullName = doc.User?.full_name || '';
    const specialization = doc.specialization || '';
    const s = search.toLowerCase();
    return fullName.toLowerCase().includes(s) || specialization.toLowerCase().includes(s);
  });

  if (loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1', fontWeight: 700, mb: 4 }}>
        Наши врачи
      </Typography>

      <TextField
        label="Поиск врача"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Grid container spacing={3}>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{doctor.User?.full_name || 'Врач'}</Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {doctor.specialization}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Телефон:</strong> {doctor.User?.phone || 'Не указан'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Кабинет:</strong> {doctor.cabinet || 'Основной'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => window.location.href = `/patient/book?doctorId=${doctor.id}`}
                  >
                    Записаться к врачу
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">Врачи не найдены</Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default PatientDoctors;