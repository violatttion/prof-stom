import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Paper, Button } from '@mui/material';

const PatientCard = () => {
  const { id } = useParams();
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">Электронная карта пациента #{id}</Typography>
      <Typography sx={{ my: 2 }}>Здесь отображается история лечения, назначения и зубная формула.</Typography>
      
      <Button 
        component={Link} 
        to={`/doctor/teeth/1`} 
        variant="contained" 
        color="secondary"
      >
        Открыть интерактивную зубную формулу
      </Button>
    </Paper>
  );
};

export default PatientCard;
