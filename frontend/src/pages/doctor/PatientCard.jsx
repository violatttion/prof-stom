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
        Для просмотра интерактивной зубной формулы нужно сначала создать запись на приём этому пациенту.
      </Typography>

      <Button 
        component={Link} 
        to={`/doctor/teeth/${id}`}   // передаём ID пациента (позже можно улучшить)
        variant="contained" 
        color="secondary"
      >
        Открыть зубную формулу (демо)
      </Button>
    </Paper>
  );
};

export default PatientCard;