import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Paper, Button, Alert } from '@mui/material';

const PatientCard = () => {
  const { id } = useParams();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Электронная карта пациента #{id}
      </Typography>

      <Alert severity="info" sx={{ my: 2 }}>
        Здесь будет отображаться история лечения и назначения.
      </Alert>

      <Typography sx={{ mb: 3 }}>
        Выберите приём для просмотра зубной формулы:
      </Typography>

      <Button 
        component={Link} 
        to="/doctor/teeth/2" 
        variant="contained" 
        color="secondary" 
        sx={{ mr: 2, mb: 1 }}
      >
        Зубная формула (Приём №2)
      </Button>

      <Button 
        component={Link} 
        to="/doctor/teeth/3" 
        variant="outlined" 
        color="secondary"
      >
        Зубная формула (Приём №3)
      </Button>
    </Paper>
  );
};

export default PatientCard;