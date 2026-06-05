import React, { useEffect, useState } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Button, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPatients = async () => {
      try {
        // Получаем все записи врача
        const res = await api.get('/appointments');

        // Извлекаем уникальных пациентов
        const uniquePatients = {};

        res.data.forEach((app) => {
          if (app.Patient && app.Patient.User) {
            const patient = app.Patient;
            if (!uniquePatients[patient.id]) {
              uniquePatients[patient.id] = {
                id: patient.id,
                full_name: patient.User.full_name,
                phone: patient.User.phone,
                lastVisit: app.appointment_date,
              };
            }
          }
        });

        setPatients(Object.values(uniquePatients));
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить список пациентов');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPatients();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Загрузка пациентов...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Мои пациенты
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {patients.length === 0 ? (
        <Alert severity="info">
          Пока нет пациентов. Попросите пациентов записаться на приём через личный кабинет.
        </Alert>
      ) : (
        <List>
          {patients.map((patient) => (
            <ListItem key={patient.id} divider>
              <ListItemText
                primary={patient.full_name}
                secondary={`Телефон: ${patient.phone || '—'} | Последний визит: ${patient.lastVisit}`}
              />
              <Button
                component={Link}
                to={`/doctor/patient/${patient.id}`}
                variant="outlined"
              >
                Открыть карту
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default Patients;